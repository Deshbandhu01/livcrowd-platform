package com.livcrowd.repository;

import com.livcrowd.model.CrowdSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CrowdSnapshotRepository extends JpaRepository<CrowdSnapshot, Long> {
    Optional<CrowdSnapshot> findFirstByPlaceIdOrderByRecordedAtDesc(Long placeId);
    List<CrowdSnapshot> findTop3ByPlaceIdOrderByRecordedAtDesc(Long placeId);
    List<CrowdSnapshot> findByPlaceIdAndRecordedAtAfterOrderByRecordedAtAsc(Long placeId, LocalDateTime recordedAt);
}
