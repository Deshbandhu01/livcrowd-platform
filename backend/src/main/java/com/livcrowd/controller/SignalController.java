package com.livcrowd.controller;

import com.livcrowd.service.CrowdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/signals")
public class SignalController {

    @Autowired
    private CrowdService crowdService;

    @PostMapping("/checkin")
    public ResponseEntity<?> checkin(@RequestBody Map<String, Long> payload) {
        Long placeId = payload.get("placeId");
        if (placeId != null) {
            crowdService.registerSignal(placeId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
