package com.livcrowd.service;

import com.livcrowd.dto.CrowdStatusDTO;
import com.livcrowd.model.*;
import com.livcrowd.repository.CrowdSnapshotRepository;
import com.livcrowd.repository.PlaceConfigRepository;
import com.livcrowd.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class CrowdService {

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private CrowdSnapshotRepository snapshotRepository;

    @Autowired
    private PlaceConfigRepository configRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // In-memory counter for signal checks per place
    private final ConcurrentHashMap<Long, AtomicInteger> signalCounts = new ConcurrentHashMap<>();

    // Smoothing factor alpha
    private static final double ALPHA = 0.4;

    public void registerSignal(Long placeId) {
        signalCounts.computeIfAbsent(placeId, k -> new AtomicInteger(0)).incrementAndGet();
    }

    @Scheduled(fixedRateString = "${livcrowd.crowd.snapshot-interval-sec:30}000")
    public void calculateCrowdMetrics() {
        List<Place> places = placeRepository.findAll();

        for (Place place : places) {
            if (!place.getIsActive()) continue;

            Long placeId = place.getId();
            int currentSignals = signalCounts.getOrDefault(placeId, new AtomicInteger(0)).getAndSet(0);
            
            PlaceConfig config = configRepository.findByPlaceId(placeId).orElseGet(() -> {
                PlaceConfig newConfig = new PlaceConfig();
                newConfig.setPlace(place);
                return configRepository.save(newConfig);
            });

            // Get previous snapshot
            CrowdSnapshot prev = snapshotRepository.findFirstByPlaceIdOrderByRecordedAtDesc(placeId).orElse(null);
            double prevSmoothed = prev != null && prev.getSmoothedValue() != null ? prev.getSmoothedValue() : 0;
            
            // Exponential smoothing
            double currentSmoothed = (ALPHA * currentSignals) + ((1 - ALPHA) * prevSmoothed);

            CrowdSnapshot current = new CrowdSnapshot();
            current.setPlace(place);
            current.setSignalCount(currentSignals);
            current.setSmoothedValue(currentSmoothed);

            // Calculate level
            if (config.getAlwaysCrowded() || currentSmoothed >= config.getMediumThreshold()) {
                current.setCrowdLevel(CrowdLevel.HIGH);
                current.setWaitTimeMin(20);
                current.setWaitTimeMax(45);
            } else if (currentSmoothed >= config.getLowThreshold()) {
                current.setCrowdLevel(CrowdLevel.MEDIUM);
                current.setWaitTimeMin(5);
                current.setWaitTimeMax(20);
            } else {
                current.setCrowdLevel(CrowdLevel.LOW);
                current.setWaitTimeMin(0);
                current.setWaitTimeMax(5);
            }

            // Determine trend
            if (prev != null) {
                if (currentSmoothed > prevSmoothed * 1.1) {
                    current.setTrend(Trend.INCREASING);
                } else if (currentSmoothed < prevSmoothed * 0.9) {
                    current.setTrend(Trend.DECREASING);
                } else {
                    current.setTrend(Trend.STABLE);
                }
            } else {
                current.setTrend(Trend.STABLE);
            }

            snapshotRepository.save(current);

            // Broadcast newly calculated status
            broadcastStatus(placeId, current);
        }
    }

    private void broadcastStatus(Long placeId, CrowdSnapshot snapshot) {
        CrowdStatusDTO dto = new CrowdStatusDTO();
        dto.setPlaceId(placeId);
        dto.setCrowdLevel(snapshot.getCrowdLevel());
        dto.setTrend(snapshot.getTrend());
        dto.setWaitTimeMin(snapshot.getWaitTimeMin());
        dto.setWaitTimeMax(snapshot.getWaitTimeMax());
        dto.setUpdatedAt(snapshot.getRecordedAt().format(DateTimeFormatter.ISO_DATE_TIME));

        // Send to specific place topic
        messagingTemplate.convertAndSend("/topic/crowd/" + placeId, dto);
        // Send to global all topic
        messagingTemplate.convertAndSend("/topic/crowd/all", dto);
    }
}
