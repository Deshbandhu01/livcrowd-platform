package com.livcrowd.dto;

import com.livcrowd.model.CrowdLevel;
import com.livcrowd.model.Trend;
import lombok.Data;

@Data
public class PlaceOverrideRequest {
    private CrowdLevel crowdLevel;
    private Trend trend;
    private Integer waitTimeMin;
    private Integer waitTimeMax;
}
