package com.bookfair.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Collection;

@Data
@Builder
public class EventMapResponse {
    private Long eventId;
    private String eventName;
    private List<StallResponse> stalls;
    private Object layout;
    private Collection<Object> halls;
    private String zones;
}
