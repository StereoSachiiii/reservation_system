package com.bookfair.repository;

import com.bookfair.entity.StallPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StallPositionRepository extends JpaRepository<StallPosition, Long> {
    List<StallPosition> findByHallLayoutId(Long hallLayoutId);
    void deleteByHallLayoutId(Long hallLayoutId);
}
