package com.bookfair.service;

import com.bookfair.entity.Event;
import com.bookfair.entity.EventStall;
import com.bookfair.entity.StallTemplate;
import com.bookfair.repository.EventStallRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.anyList;

class PricingServiceTest {

    @Mock
    private EventStallRepository eventStallRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        pricingService = new PricingService(eventStallRepository, objectMapper);
    }

    @Test
    void calculatePriceBreakdown_ShouldApplyProximityBonus() throws Exception {
        // Arrange
        StallTemplate template = StallTemplate.builder()
                .defaultProximityScore(5)
                .geometry("{\"x\": 10, \"y\": 10, \"w\": 10, \"h\": 10}")
                .build();
        
        EventStall stall = EventStall.builder()
                .id(1L)
                .stallTemplate(template)
                .baseRateCents(100000L)
                .geometry("{\"x\": 10, \"y\": 10, \"w\": 10, \"h\": 10}")
                .build();

        String layoutConfig = "{" +
                "\"width\": 1000, \"height\": 800," +
                "\"influences\": [" +
                "  {\"x\": 150, \"y\": 150, \"radius\": 200, \"intensity\": 80, \"type\": \"ENTRANCE\", \"falloff\": \"LINEAR\"}" +
                "]" +
                "}";
        JsonNode layoutNode = objectMapper.readTree(layoutConfig);

        // Act
        Map<String, Object> breakdown = pricingService.calculatePriceBreakdown(stall, layoutNode);

        // Assert
        assertTrue(breakdown.containsKey("Visibility Score"));
        int score = (int) breakdown.get("calculatedScore");
        assertTrue(score > 5, "Score should be higher than minimum due to proximity");
        
        List<Map<String, Object>> drivers = (List<Map<String, Object>>) breakdown.get("Value Drivers");
        assertFalse(drivers.isEmpty());
        assertEquals("ENTRANCE Proximity", drivers.get(0).get("label"));
    }

    @Test
    void calculatePriceBreakdown_ShouldApplyEdgePenalty() throws Exception {
        // Arrange
        StallTemplate template = StallTemplate.builder().defaultProximityScore(5).build();
        EventStall stall = EventStall.builder()
                .id(1L)
                .stallTemplate(template)
                .baseRateCents(100000L)
                .geometry("{\"x\": 0, \"y\": 10, \"w\": 10, \"h\": 10}") // At edge
                .build();

        String layoutConfig = "{\"width\": 1000, \"height\": 800, \"influences\": []}";
        JsonNode layoutNode = objectMapper.readTree(layoutConfig);

        // Act
        Map<String, Object> breakdown = pricingService.calculatePriceBreakdown(stall, layoutNode);

        // Assert
        List<Map<String, Object>> drivers = (List<Map<String, Object>>) breakdown.get("Value Drivers");
        boolean hasEdgePenalty = drivers.stream().anyMatch(d -> "Edge Distance".equals(d.get("label")));
        assertTrue(hasEdgePenalty);
    }

    @Test
    void recalculateEventPrices_ShouldUpdateStalls() throws Exception {
        // Arrange
        Long eventId = 101L;
        Event event = Event.builder().id(eventId).layoutConfig("{\"width\": 1000, \"height\": 800, \"influences\": []}").build();
        
        StallTemplate template = StallTemplate.builder().defaultProximityScore(5).id(1L).build();
        EventStall stall = EventStall.builder()
                .event(event)
                .stallTemplate(template)
                .baseRateCents(100000L)
                .multiplier(1.0)
                .geometry("{\"x\": 50, \"y\": 50, \"w\": 10, \"h\": 10}")
                .build();

        when(eventStallRepository.findByEvent_Id(eventId)).thenReturn(List.of(stall));

        // Act
        pricingService.recalculateEventPrices(eventId);

        // Assert
        verify(eventStallRepository, times(1)).saveAll(anyList());
        assertNotNull(stall.getPricingVersion());
        assertTrue(stall.getPricingVersion().startsWith("AUTO_V1_"));
    }
}
