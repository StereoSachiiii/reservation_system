package com.bookfair.features.reservation.dto;

import com.bookfair.entity.BusinessCategory;
import com.bookfair.entity.StallSize;
import com.bookfair.entity.StallType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for submitting a new stall reservation request.
 *
 * Assessment 2 — all 8 mandatory reservation fields are validated here:
 *  i.   username        — derived from JWT Principal (not in this DTO)
 *  ii.  eventName       — predefined list, required
 *  iii. reservationDate — calendar selection on/after today
 *  iv.  stallType       — Standard, Premium, or Corner Stall
 *  v.   preferredSize   — Small, Medium, or Large
 *  vi.  numberOfStalls  — 1–10
 *  vii. businessCategory — Food & Beverage, Clothing, Electronics, etc.
 *  viii. specialRequirements — optional comments
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationRequest {

    /** Internal user ID (populated by backend from Principal, can be sent by client). */
    private Long userId;

    /** One or more specific stall IDs selected on the canvas map. */
    private List<Long> stallIds;

    /** ID of the event/exhibition being booked. */
    private Long eventId;

    /**
     * Human-readable name of the exhibition or event.
     * Assessment requirement ii: selected from a predefined list.
     */
    @NotBlank(message = "Exhibition / Event name is required")
    private String eventName;

    /**
     * Desired start date for the reservation.
     * Assessment requirement iii: must be on or after the current date.
     */
    @NotNull(message = "Reservation date is required")
    @FutureOrPresent(message = "Reservation date must be on or after the current date")
    private LocalDate reservationDate;

    /**
     * Preferred stall type (Standard, Premium, Corner Stall).
     * Assessment requirement iv.
     */
    @NotNull(message = "Stall type is required")
    private StallType stallType;

    /**
     * Preferred stall size (Small, Medium, Large).
     * Assessment requirement v.
     */
    @NotNull(message = "Preferred stall size is required")
    private StallSize preferredSize;

    /**
     * How many stalls the vendor requires (1–10).
     * Assessment requirement vi.
     */
    @NotNull(message = "Number of stalls is required")
    @Min(value = 1, message = "At least 1 stall must be requested")
    @Max(value = 10, message = "A maximum of 10 stalls can be requested per booking")
    private Integer numberOfStalls;

    /**
     * Business sector classification.
     * Assessment requirement vii: Food & Beverage, Clothing, Electronics, Handicrafts, Services, etc.
     */
    @NotNull(message = "Business category is required")
    private BusinessCategory businessCategory;

    /**
     * Free-text field for any special setup or logistical requirements.
     * Assessment requirement viii: optional comments.
     */
    private String specialRequirements;
}
