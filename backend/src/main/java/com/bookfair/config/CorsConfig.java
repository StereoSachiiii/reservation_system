package com.bookfair.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS Configuration
 * Allows frontend (localhost:5173) to call this API
 * 
 * normally you only can call this api from you front end or another portal that you use 
 * 
 */
@Configuration
public class CorsConfig {
    
    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String allowedOrigin;

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(java.util.List.of(allowedOrigin));
        config.setAllowedHeaders(java.util.List.of("*"));
        config.setAllowedMethods(java.util.List.of("*"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
