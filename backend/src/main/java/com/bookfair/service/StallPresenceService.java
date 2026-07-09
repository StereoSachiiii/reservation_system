package com.bookfair.service;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StallPresenceService {
    // Map of stallId to Set of usernames
    private final ConcurrentHashMap<Long, Set<String>> stallViewers = new ConcurrentHashMap<>();

    public void markViewing(Long stallId, String username) {
        stallViewers.computeIfAbsent(stallId, k -> ConcurrentHashMap.newKeySet()).add(username);
    }
    
    public void unmarkViewing(Long stallId, String username) {
        Set<String> viewers = stallViewers.get(stallId);
        if (viewers != null) {
            viewers.remove(username);
        }
    }
    
    public int getViewerCount(Long stallId) {
        Set<String> viewers = stallViewers.get(stallId);
        return viewers != null ? viewers.size() : 0;
    }
}
