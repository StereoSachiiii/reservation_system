package com.bookfair.service;

import com.bookfair.dto.request.LoginRequest;
import com.bookfair.dto.response.AuthResponse;
import com.bookfair.entity.User;
import com.bookfair.repository.UserRepository;
import com.bookfair.security.JwtUtils;
import com.bookfair.exception.ResourceNotFoundException;
import com.bookfair.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Authentication operations (Login/Logout).
 * User registration is handled by UserService to separate concerns.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtils jwtUtils;

    private final com.bookfair.repository.PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.bookfair.security.GoogleTokenVerifier googleTokenVerifier;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        return new AuthResponse(jwt, userService.mapToUserResponse(user));
    }

    public AuthResponse googleLogin(String idTokenString) {
        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = googleTokenVerifier.verifyToken(idTokenString);
        if (payload == null) {
            throw new BadRequestException("Invalid Google token");
        }

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            // Generate a unique username based on email
            String baseUsername = email.split("@")[0];
            String uniqueUsername = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsername(uniqueUsername)) {
                uniqueUsername = baseUsername + counter;
                counter++;
            }
            user.setUsername(uniqueUsername);
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setRole(User.Role.VENDOR);
            user.setBusinessName(name);
            user = userRepository.save(user);
        }

        String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());
        return new AuthResponse(jwt, userService.mapToUserResponse(user));
    }

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @org.springframework.transaction.annotation.Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Create token
        String token = java.util.UUID.randomUUID().toString();
        com.bookfair.entity.PasswordResetToken resetToken = com.bookfair.entity.PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(15)) // 15 min expiry
                .build();
        
        // Remove old tokens
        tokenRepository.deleteByUser(user);
        tokenRepository.save(resetToken);

        // Send Email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendSimpleEmail(user.getEmail(), "Password Reset Request", 
            "Click the link to reset your password: " + resetLink + "\n\nLink expires in 15 minutes.");
    }

    @org.springframework.transaction.annotation.Transactional
    public void completePasswordReset(String token, String newPassword) {
        com.bookfair.entity.PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid token"));

        if (resetToken.isExpired()) {
            throw new BadRequestException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        tokenRepository.delete(resetToken);
    }

}
