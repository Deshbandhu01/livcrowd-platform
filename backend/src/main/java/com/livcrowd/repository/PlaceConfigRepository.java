package com.livcrowd.repository;

import com.livcrowd.model.PlaceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlaceConfigRepository extends JpaRepository<PlaceConfig, Long> {
    Optional<PlaceConfig> findByPlaceId(Long placeId);
}
