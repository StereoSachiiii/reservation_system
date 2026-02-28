package com.bookfair.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VenueAdminResponse {
    private Long id;
    private String name;
    private String address;
}
