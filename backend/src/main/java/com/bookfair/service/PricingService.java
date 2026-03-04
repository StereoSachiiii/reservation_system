package com.bookfair.service;

import com.bookfair.entity.EventStall;
import com.bookfair.repository.EventStallRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.bookfair.constant.ScoringConstants.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    private final EventStallRepository eventStallRepository;
    private final ObjectMapper objectMapper;

    /**
     * Recalculates prices for all stalls in an event based on the current layout.
     */
    @Transactional
    public void recalculateEventPrices(Long eventId) {
        log.info("Recalculating prices for event ID: {}", eventId);
        List<EventStall> stalls = eventStallRepository.findByEvent_Id(eventId);
        if (stalls.isEmpty()) return;

        String layoutConfig = stalls.get(0).getEvent().getLayoutConfig();
        if (layoutConfig == null || layoutConfig.trim().isEmpty() || layoutConfig.equals("{}")) {
            log.warn("No layout config found for event {}, skipping automated pricing.", eventId);
            return;
        }

        try {
            JsonNode layoutNode = objectMapper.readTree(layoutConfig);
            for (EventStall stall : stalls) {
                calculateAndApplyPrice(stall, layoutNode);
            }
            eventStallRepository.saveAll(stalls);
        } catch (Exception e) {
            log.error("Failed to parse layout config for event {}: {}", eventId, e.getMessage());
        }
    }

    /**
     * Calculates the price for a single stall and updates its fields.
     */
    public Map<String, Object> calculatePriceBreakdown(EventStall stall, JsonNode layoutNode) {
        String geometryStr = stall.getGeometry() != null ? stall.getGeometry() : stall.getStallTemplate().getGeometry();
        long baseRateCents = stall.getBaseRateCents();
        int defaultProximityScore = stall.getStallTemplate().getDefaultProximityScore();
        double multiplier = stall.getMultiplier();

        return calculatePriceBreakdown(geometryStr, baseRateCents, defaultProximityScore, multiplier, layoutNode);
    }

    /**
     * Calculates the price for a single stall providing layout config as string
     */
    public Map<String, Object> calculatePriceBreakdownStringConfig(String geometryStr, long baseRateCents, int defaultProximityScore, double multiplier, String layoutConfig) {
        try {
            JsonNode layoutNode = objectMapper.readTree(layoutConfig);
            return calculatePriceBreakdown(geometryStr, baseRateCents, defaultProximityScore, multiplier, layoutNode);
        } catch (Exception e) {
            log.error("Failed to parse layout config for interactive pricing: {}", e.getMessage());
            Map<String, Object> breakdown = new HashMap<>();
            breakdown.put("Base Rate", baseRateCents);
            breakdown.put("calculateScore", defaultProximityScore * DEFAULT_PROXIMITY_MULTIPLIER);
            breakdown.put("Visibility Score", (defaultProximityScore * DEFAULT_PROXIMITY_MULTIPLIER) + "/100");
            double scoreFactor = 1.0 + ((defaultProximityScore * DEFAULT_PROXIMITY_MULTIPLIER) - 50) / 100.0;
            long finalPriceCents = (long) (baseRateCents * scoreFactor * multiplier);
            breakdown.put("Final Price", finalPriceCents);
            return breakdown;
        }
    }

    /**
     * Calculates the price for a single stall without requiring a persisted entity.
     */
    public Map<String, Object> calculatePriceBreakdown(String geometryStr, long baseRateCents, int defaultProximityScore, double multiplier, JsonNode layoutNode) {
        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("Base Rate", baseRateCents);

        int calculatedScore = 0;
        List<Map<String, Object>> drivers = new ArrayList<>();

        try {
            double canvasWidth = layoutNode.has("width") ? layoutNode.get("width").asDouble() : 1000.0;
            double canvasHeight = layoutNode.has("height") ? layoutNode.get("height").asDouble() : 800.0;
            
            JsonNode influences = layoutNode.get("influences");

            if (geometryStr != null && !geometryStr.trim().isEmpty()) {
                JsonNode stallGeom = objectMapper.readTree(geometryStr);
                if (stallGeom.has("x") && stallGeom.has("y")) {
                    double stallX = stallGeom.get("x").asDouble() + (stallGeom.has("w") ? stallGeom.get("w").asDouble() / 2 : 0);
                    double stallY = stallGeom.get("y").asDouble() + (stallGeom.has("h") ? stallGeom.get("h").asDouble() / 2 : 0);

                    if (influences != null && influences.isArray()) {
                        for (JsonNode influence : influences) {
                            double infX = influence.get("x").asDouble();
                            double infY = influence.get("y").asDouble();
                            double radius = influence.get("radius").asDouble();
                            int intensity = influence.get("intensity").asInt();
                            String typeStr = influence.get("type").asText();
                            String falloffStr = influence.get("falloff").asText();

                            double normStallX = (stallX / 100.0) * canvasWidth;
                            double normStallY = (stallY / 100.0) * canvasHeight;

                            double dist = Math.sqrt(Math.pow(normStallX - infX, 2) + Math.pow(normStallY - infY, 2));

                            if (dist < radius) {
                                double factor = 1.0 - (dist / radius);
                                if ("EXPONENTIAL".equals(falloffStr)) factor = Math.pow(factor, 2);
                                
                                int contribution = (int) (intensity * factor);
                                if (contribution > 0) {
                                    calculatedScore += contribution;
                                    Map<String, Object> driver = new HashMap<>();
                                    driver.put("label", typeStr + " Proximity");
                                    driver.put("value", "+" + contribution);
                                    drivers.add(driver);
                                }
                            }
                        }
                    }
                }
            }
            
            // Apply Edge Distance Penalty
            if (geometryStr != null && (geometryStr.contains("\"x\": 0") || geometryStr.contains("\"x\": 0.0") ||
                geometryStr.contains("\"y\": 0") || geometryStr.contains("\"y\": 0.0"))) {
                calculatedScore -= EDGE_DISTANCE_PENALTY;
                Map<String, Object> penalty = new HashMap<>();
                penalty.put("label", "Edge Distance");
                penalty.put("value", "-" + EDGE_DISTANCE_PENALTY);
                drivers.add(penalty);
            }

        } catch (Exception e) {
            log.error("Price calculation failed for geometry string: {}", e.getMessage());
            calculatedScore = defaultProximityScore * DEFAULT_PROXIMITY_MULTIPLIER;
        }

        calculatedScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, calculatedScore));
        
        breakdown.put("Visibility Score", calculatedScore + "/100");
        breakdown.put("Value Drivers", drivers);
        breakdown.put("calculatedScore", calculatedScore);

        double scoreFactor = 1.0 + (calculatedScore - 50) / 100.0;
        long finalPriceCents = (long) (baseRateCents * scoreFactor * multiplier);
        breakdown.put("Final Price", finalPriceCents);

        return breakdown;
    }

    private void calculateAndApplyPrice(EventStall stall, JsonNode layoutNode) {
        Map<String, Object> breakdown = calculatePriceBreakdown(stall, layoutNode);
        int score = (int) breakdown.get("calculatedScore");
        
        // Automation Routine: Final Price = Base Rate * (1 + (Score-50)/100.0) * Multiplier
        // If score is 50 (neutral), price is base. If 100, price is base * 1.5.
        double scoreFactor = 1.0 + (score - 50) / 100.0;
        long proximityBonus = (long) (stall.getBaseRateCents() * (score - 50) / 100.0);
        
        stall.setProximityBonusCents(proximityBonus);
        stall.setFinalPriceCents((long) (stall.getBaseRateCents() * scoreFactor * stall.getMultiplier()));
        stall.setPricingVersion("AUTO_V1_SCORE_" + score);
    }
}
