package com.bookfair.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stall_positions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnore
    private StallTemplate stallTemplate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_layout_id", nullable = false)
    @JsonIgnore
    private HallLayout hallLayout;

    @Column(nullable = false)
    private Double xPct;

    @Column(nullable = false)
    private Double yPct;

    @Column(nullable = false)
    private Double widthPct;

    @Column(nullable = false)
    private Double heightPct;

    @Builder.Default
    private Double rotationDeg = 0.0;
}
