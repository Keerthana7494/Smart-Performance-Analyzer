package com.smartperformance.auth.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class TemporaryPasswordGenerator {
    private final SecureRandom secureRandom = new SecureRandom();

    /** Generates 24 random bytes (192 bits), encoded as a URL-safe password. */
    public String generate() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
