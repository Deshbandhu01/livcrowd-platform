package com.livcrowd.dto;

import com.livcrowd.model.CrowdLevel;
import com.livcrowd.model.Trend;
import lombok.Data;

@Data
public class CrowdStatusDTO {
    private Long placeId;
    private CrowdLevel crowdLevel;
    private Trend trend;
    private Integer waitTimeMin;
    private Integer waitTimeMax;
    private String updatedAt;
}
