package com.bookfair.features.reservation.dto;

import com.bookfair.entity.BusinessCategory;
import com.bookfair.entity.StallSize;
import com.bookfair.entity.StallType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationRequest {
    private Long userId;

    private List<Long> stallIds;

    private Long eventId;

    private String eventName;

    @FutureOrPresent(message = "Reservation date must be on or after the current date")
    private LocalDate reservationDate;

    private StallType stallType;

    private StallSize preferredSize;

    private Integer numberOfStalls;

    private BusinessCategory businessCategory;

    private String specialRequirements;
}
