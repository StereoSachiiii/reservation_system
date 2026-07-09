package com.bookfair.controller;

import com.bookfair.entity.HallLayout;
import com.bookfair.entity.StallPosition;
import com.bookfair.repository.HallLayoutRepository;
import com.bookfair.repository.StallPositionRepository;
import com.bookfair.repository.HallRepository;
import com.bookfair.repository.StallTemplateRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/hall-layouts")
@RequiredArgsConstructor
public class AdminHallLayoutController {

    private final HallLayoutRepository hallLayoutRepository;
    private final StallPositionRepository stallPositionRepository;
    private final HallRepository hallRepository;
    private final StallTemplateRepository stallTemplateRepository;

    @Data
    public static class HallLayoutRequest {
        private String imageUrl;
        private Integer imageWidthPx;
        private Integer imageHeightPx;
    }

    @Data
    public static class StallPositionRequest {
        private Long stallTemplateId;
        private Double xPct;
        private Double yPct;
        private Double widthPct;
        private Double heightPct;
    }

    @PostMapping("/hall/{hallId}")
    @Transactional
    public ResponseEntity<HallLayout> saveLayout(@PathVariable Long hallId, @RequestBody HallLayoutRequest req) {
        HallLayout layout = hallLayoutRepository.findByHallId(hallId)
            .orElseGet(() -> HallLayout.builder().hall(hallRepository.getReferenceById(hallId)).build());
        
        layout.setImageUrl(req.getImageUrl());
        layout.setImageWidthPx(req.getImageWidthPx());
        layout.setImageHeightPx(req.getImageHeightPx());
        
        return ResponseEntity.ok(hallLayoutRepository.save(layout));
    }

    @PostMapping("/{layoutId}/positions")
    @Transactional
    public ResponseEntity<Void> savePositions(@PathVariable Long layoutId, @RequestBody List<StallPositionRequest> reqs) {
        HallLayout layout = hallLayoutRepository.getReferenceById(layoutId);
        
        stallPositionRepository.deleteByHallLayoutId(layoutId);
        
        List<StallPosition> positions = reqs.stream().map(req -> 
            StallPosition.builder()
                .hallLayout(layout)
                .stallTemplate(stallTemplateRepository.getReferenceById(req.getStallTemplateId()))
                .xPct(req.getXPct())
                .yPct(req.getYPct())
                .widthPct(req.getWidthPct())
                .heightPct(req.getHeightPct())
                .build()
        ).collect(Collectors.toList());
        
        stallPositionRepository.saveAll(positions);
        return ResponseEntity.ok().build();
    }
}
