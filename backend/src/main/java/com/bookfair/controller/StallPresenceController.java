package com.bookfair.controller;

import com.bookfair.dto.StallPresenceEvent;
import com.bookfair.service.StallPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class StallPresenceController {

    private final StallPresenceService stallPresenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/stall/{stallId}/select")
    public void onStallSelect(@DestinationVariable Long stallId, Principal user) {
        String username = (user != null && user.getName() != null) ? user.getName() : "AnonymousUser";
        stallPresenceService.markViewing(stallId, username);
        
        int viewerCount = stallPresenceService.getViewerCount(stallId);
        
        messagingTemplate.convertAndSend(
                "/topic/stalls/" + stallId,
                new StallPresenceEvent(stallId, "VIEWING", username, viewerCount)
        );
    }
    
    @MessageMapping("/stall/{stallId}/deselect")
    public void onStallDeselect(@DestinationVariable Long stallId, Principal user) {
        String username = (user != null && user.getName() != null) ? user.getName() : "AnonymousUser";
        stallPresenceService.unmarkViewing(stallId, username);
        
        int viewerCount = stallPresenceService.getViewerCount(stallId);
        
        messagingTemplate.convertAndSend(
                "/topic/stalls/" + stallId,
                new StallPresenceEvent(stallId, "AVAILABLE", username, viewerCount)
        );
    }
}
