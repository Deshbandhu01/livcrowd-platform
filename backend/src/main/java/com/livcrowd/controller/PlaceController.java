package com.livcrowd.controller;

import com.livcrowd.dto.CrowdStatusDTO;
import com.livcrowd.model.CrowdSnapshot;
import com.livcrowd.model.Place;
import com.livcrowd.repository.CrowdSnapshotRepository;
import com.livcrowd.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private CrowdSnapshotRepository snapshotRepository;

    @GetMapping
    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Place> getPlace(@PathVariable Long id) {
        return placeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Place> searchPlaces(@RequestParam String q) {
        return placeRepository.findByNameContainingIgnoreCase(q);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<CrowdStatusDTO> getStatus(@PathVariable Long id) {
        return snapshotRepository.findFirstByPlaceIdOrderByRecordedAtDesc(id)
                .map(this::mapToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<CrowdSnapshot>> getHistory(@PathVariable Long id) {
        // Last 24h history (simplified to top 3 or specific range based on requirements)
        // Here we just return all for simplicity
        List<CrowdSnapshot> history = snapshotRepository.findTop3ByPlaceIdOrderByRecordedAtDesc(id);
        return ResponseEntity.ok(history);
    }

    private CrowdStatusDTO mapToDTO(CrowdSnapshot snapshot) {
        CrowdStatusDTO dto = new CrowdStatusDTO();
        dto.setPlaceId(snapshot.getPlace().getId());
        dto.setCrowdLevel(snapshot.getCrowdLevel());
        dto.setTrend(snapshot.getTrend());
        dto.setWaitTimeMin(snapshot.getWaitTimeMin());
        dto.setWaitTimeMax(snapshot.getWaitTimeMax());
        dto.setUpdatedAt(snapshot.getRecordedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        return dto;
    }
}
