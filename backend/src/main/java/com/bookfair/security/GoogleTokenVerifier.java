package com.bookfair.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@lombok.extern.slf4j.Slf4j
public class GoogleTokenVerifier {

    private static final java.util.List<String> VALID_ISSUERS = java.util.Arrays.asList(
            "https://accounts.google.com",
            "accounts.google.com"
    );

    @Value("${app.oauth.google.clientId}")
    private String clientId;

    public GoogleIdToken.Payload verifyToken(String idTokenString) {
        if (idTokenString == null || idTokenString.trim().isEmpty()) {
            log.warn("Google ID token verification failed: empty token provided");
            return null;
        }

        if (clientId == null || clientId.trim().isEmpty() || "your_google_client_id_here".equals(clientId.trim())) {
            log.error("Google OAuth client ID is not properly configured in backend properties");
            return null;
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .setIssuers(VALID_ISSUERS)
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                log.warn("Google ID token verification returned null: signature, audience, issuer, or expiration check failed");
                return null;
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (payload == null) {
                log.warn("Google ID token payload is null");
                return null;
            }

            // Verify email claim exists and email is verified by Google
            String email = payload.getEmail();
            Boolean emailVerified = payload.getEmailVerified();
            if (email == null || email.trim().isEmpty()) {
                log.warn("Google ID token rejected: missing email claim");
                return null;
            }

            if (emailVerified == null || !emailVerified) {
                log.warn("Google ID token rejected: email is not verified by Google for {}", email);
                return null;
            }

            return payload;
        } catch (Exception e) {
            log.error("Google ID token cryptographic verification exception: {}", e.getMessage(), e);
            return null;
        }
    }
}
