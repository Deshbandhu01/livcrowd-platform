package com.livcrowd.controller;

import com.livcrowd.dto.CrowdStatusDTO;
import com.livcrowd.dto.PlaceOverrideRequest;
import com.livcrowd.model.CrowdSnapshot;
import com.livcrowd.model.Place;
import com.livcrowd.model.PlaceConfig;
import com.livcrowd.repository.CrowdSnapshotRepository;
import com.livcrowd.repository.PlaceConfigRepository;
import com.livcrowd.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private PlaceConfigRepository configRepository;

    @Autowired
    private CrowdSnapshotRepository snapshotRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlaces", placeRepository.count());
        stats.put("activePlaces", placeRepository.findAll().stream().filter(Place::getIsActive).count());
        stats.put("totalSignals", snapshotRepository.count()); // Simplification
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/places")
    public Place createPlace(@RequestBody Place place) {
        return placeRepository.save(place);
    }

    @PutMapping("/places/{id}")
    public ResponseEntity<Place> updatePlace(@PathVariable Long id, @RequestBody Place updateParams) {
        return placeRepository.findById(id).map(place -> {
            place.setName(updateParams.getName());
            place.setCategory(updateParams.getCategory());
            place.setAddress(updateParams.getAddress());
            place.setCapacity(updateParams.getCapacity());
            place.setIsActive(updateParams.getIsActive());
            return ResponseEntity.ok(placeRepository.save(place));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/places/{id}")
    public ResponseEntity<?> deletePlace(@PathVariable Long id) {
        if (placeRepository.existsById(id)) {
            placeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/places/{id}/config")
    public ResponseEntity<PlaceConfig> updateConfig(@PathVariable Long id, @RequestBody PlaceConfig updateConfig) {
        return configRepository.findByPlaceId(id).map(config -> {
            config.setLowThreshold(updateConfig.getLowThreshold());
            config.setMediumThreshold(updateConfig.getMediumThreshold());
            config.setSnapshotIntervalSec(updateConfig.getSnapshotIntervalSec());
            config.setAlwaysCrowded(updateConfig.getAlwaysCrowded());
            return ResponseEntity.ok(configRepository.save(config));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/places/{id}/override")
    public ResponseEntity<?> overrideCrowdStatus(@PathVariable Long id, @RequestBody PlaceOverrideRequest override) {
        return placeRepository.findById(id).map(place -> {
            CrowdSnapshot snapshot = new CrowdSnapshot();
            snapshot.setPlace(place);
            snapshot.setCrowdLevel(override.getCrowdLevel());
            snapshot.setTrend(override.getTrend());
            snapshot.setWaitTimeMin(override.getWaitTimeMin());
            snapshot.setWaitTimeMax(override.getWaitTimeMax());
            snapshot.setSignalCount(-1); // Indicator of override
            snapshot.setSmoothedValue(0.0);
            snapshot.setRecordedAt(LocalDateTime.now());
            
            snapshotRepository.save(snapshot);
            
            // Broadcast
            CrowdStatusDTO dto = new CrowdStatusDTO();
            dto.setPlaceId(id);
            dto.setCrowdLevel(snapshot.getCrowdLevel());
            dto.setTrend(snapshot.getTrend());
            dto.setWaitTimeMin(snapshot.getWaitTimeMin());
            dto.setWaitTimeMax(snapshot.getWaitTimeMax());
            dto.setUpdatedAt(snapshot.getRecordedAt().format(DateTimeFormatter.ISO_DATE_TIME));

            messagingTemplate.convertAndSend("/topic/crowd/" + id, dto);
            messagingTemplate.convertAndSend("/topic/crowd/all", dto);

            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
