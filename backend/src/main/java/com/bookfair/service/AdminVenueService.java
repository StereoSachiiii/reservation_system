package com.bookfair.service;

import com.bookfair.entity.Building;
import com.bookfair.entity.Venue;
import com.bookfair.entity.Hall;
import com.bookfair.repository.VenueRepository;
import com.bookfair.repository.BuildingRepository;
import com.bookfair.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminVenueService {

    private final VenueRepository venueRepository;
    private final BuildingRepository buildingRepository;
    private final HallRepository hallRepository;

    @Transactional(readOnly = true)
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Building> getBuildingsByVenue(Long venueId) {
        return buildingRepository.findByVenue_Id(venueId);
    }

    @Transactional(readOnly = true)
    public List<Hall> getHallsByBuilding(Long buildingId) {
        return hallRepository.findByBuilding_Id(buildingId);
    }
}
