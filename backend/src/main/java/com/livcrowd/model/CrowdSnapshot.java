package com.livcrowd.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "crowd_snapshots")
public class CrowdSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "signal_count")
    private Integer signalCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "crowd_level")
    private CrowdLevel crowdLevel;

    @Enumerated(EnumType.STRING)
    private Trend trend;

    @Column(name = "wait_time_min")
    private Integer waitTimeMin;

    @Column(name = "wait_time_max")
    private Integer waitTimeMax;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();
    
    // Virtual property utilized by smoothing/calculation
    @Transient
    private Double smoothedValue = 0.0;
}
