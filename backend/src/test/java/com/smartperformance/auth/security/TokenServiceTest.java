package com.smartperformance.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TokenServiceTest {

    private static final String SECRET = "test-secret-test-secret-test-secret-1234";
    private final TokenService service = new TokenService(SECRET, 3_600_000L);

    @Test
    void accessToken_containsSubjectAndAccessUse() {
        Claims claims = service.parse(service.createAccessToken("a@b.com"));

        assertThat(claims.getSubject()).isEqualTo("a@b.com");
        assertThat(claims.get(TokenService.TOKEN_USE, String.class)).isEqualTo(TokenService.ACCESS);
    }

    @Test
    void passwordChangeToken_isCappedAt15Minutes() {
        long tenHours = 10 * 60 * 60 * 1000L;
        Claims claims = service.parse(service.createPasswordChangeToken("a@b.com", tenHours));

        long lifetimeMs = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertThat(lifetimeMs).isLessThanOrEqualTo(15 * 60 * 1000L);
        assertThat(claims.get(TokenService.TOKEN_USE, String.class))
                .isEqualTo(TokenService.PASSWORD_CHANGE);
    }

    @Test
    void tokenSignedWithDifferentSecret_isRejected() {
        TokenService other = new TokenService("another-secret-another-secret-9999999", 3_600_000L);
        String forged = other.createAccessToken("a@b.com");

        assertThatThrownBy(() -> service.parse(forged)).isInstanceOf(JwtException.class);
    }

    @Test
    void tamperedToken_isRejected() {
        String token = service.createAccessToken("a@b.com");
        String tampered = token.substring(0, token.length() - 2) + "xx";

        assertThatThrownBy(() -> service.parse(tampered)).isInstanceOf(JwtException.class);
    }

    @Test
    void shortSecret_failsFast() {
        assertThatThrownBy(() -> new TokenService("short", 3_600_000L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void tooShortExpiration_failsFast() {
        assertThatThrownBy(() -> new TokenService(SECRET, 1000L))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
