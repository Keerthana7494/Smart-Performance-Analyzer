package com.smartperformance.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/** Creates and validates signed, standard HS256 JWTs. JWTs are signed, not encrypted. */
@Service
public class TokenService {
    public static final String TOKEN_USE = "token_use";
    public static final String ACCESS = "access";
    public static final String PASSWORD_CHANGE = "password_change";

    private final SecretKey key;
    private final long expirationMs;

    public TokenService(@Value("${app.jwt.secret}") String secret,
                        @Value("${app.jwt.expiration-ms}") long expirationMs) {
        byte[] secretBytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes. Set JWT_SECRET in the environment.");
        }
        if (expirationMs < 60_000) {
            throw new IllegalArgumentException("JWT expiration must be at least 60000 milliseconds.");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
    }

    public String createAccessToken(String email) {
        return create(email, ACCESS, expirationMs);
    }

    public String createPasswordChangeToken(String email, long restrictedTokenExpirationMs) {
        return create(email, PASSWORD_CHANGE, Math.min(restrictedTokenExpirationMs, 15 * 60 * 1000L));
    }

    private String create(String email, String use, long lifetimeMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .claim(TOKEN_USE, use)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(lifetimeMs)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parse(String token) throws JwtException {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
