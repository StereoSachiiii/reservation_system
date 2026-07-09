package com.bookfair.repository;

import com.bookfair.entity.HallLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HallLayoutRepository extends JpaRepository<HallLayout, Long> {
    Optional<HallLayout> findByHallId(Long hallId);
}
