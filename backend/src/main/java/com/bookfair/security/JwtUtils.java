package com.bookfair.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@lombok.extern.slf4j.Slf4j
public class JwtUtils {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:86400000}")
    private long jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs:604800000}")
    private long jwtRefreshExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateJwtTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateJwtTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("token_type", "ACCESS")
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("token_type", "REFRESH")
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtRefreshExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    private Key key() {
        // If the secret is 64 chars long and contains only hex chars, it's likely HEX encoded (256 bits)
        if (jwtSecret != null && jwtSecret.length() == 64 && jwtSecret.matches("^[0-9a-fA-F]+$")) {
            return Keys.hmacShaKeyFor(java.util.HexFormat.of().parseHex(jwtSecret));
        }
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
               .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.error("JWT signature is invalid: {}", e.getMessage());
        }

        return false;
    }

    public Claims getClaimsFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
    }

    public boolean validateRefreshToken(String token) {
        if (!validateJwtToken(token)) {
            return false;
        }
        try {
            Claims claims = getClaimsFromJwtToken(token);
            Object tokenType = claims.get("token_type");
            return "REFRESH".equals(tokenType);
        } catch (Exception e) {
            log.error("Failed to parse refresh token claims: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateAccessToken(String token) {
        if (!validateJwtToken(token)) {
            return false;
        }
        try {
            Claims claims = getClaimsFromJwtToken(token);
            Object tokenType = claims.get("token_type");
            // Allow tokens without token_type claim for backwards compatibility with existing issued tokens
            return tokenType == null || "ACCESS".equals(tokenType);
        } catch (Exception e) {
            log.error("Failed to parse access token claims: {}", e.getMessage());
            return false;
        }
    }
}
