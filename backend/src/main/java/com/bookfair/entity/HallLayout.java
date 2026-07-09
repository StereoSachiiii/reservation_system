package com.bookfair.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hall_layouts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallLayout {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    @JsonIgnore
    private Hall hall;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private Integer imageWidthPx;

    @Column(nullable = false)
    private Integer imageHeightPx;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
