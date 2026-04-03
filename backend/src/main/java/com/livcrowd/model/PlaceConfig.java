package com.livcrowd.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "place_configs")
public class PlaceConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", unique = true)
    private Place place;

    @Column(name = "low_threshold", columnDefinition = "int default 30")
    private Integer lowThreshold = 30;

    @Column(name = "medium_threshold", columnDefinition = "int default 70")
    private Integer mediumThreshold = 70;

    @Column(name = "snapshot_interval_sec", columnDefinition = "int default 30")
    private Integer snapshotIntervalSec = 30;

    @Column(name = "always_crowded", columnDefinition = "boolean default false")
    private Boolean alwaysCrowded = false;
}
