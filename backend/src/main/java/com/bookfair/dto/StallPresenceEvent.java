package com.bookfair.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StallPresenceEvent {
    private Long stallId;
    private String status;
    private String username;
    private Integer viewerCount;
}
