package com.smartperformance.auth.security;

import com.smartperformance.auth.entity.User;
import com.smartperformance.auth.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class BearerTokenFilter extends OncePerRequestFilter {
    private final TokenService tokenService;
    private final UserRepository userRepository;

    public BearerTokenFilter(TokenService tokenService, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = tokenService.parse(header.substring(7).trim());
                String email = claims.getSubject();
                String tokenUse = claims.get(TokenService.TOKEN_USE, String.class);
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null && user.getIsActive() != null && user.getIsActive() == 1) {
                    boolean mustChange = user.getMustChangePassword() != null && user.getMustChangePassword() == 1;
                    boolean tempExpired = user.getPasswordExpiresAt() != null
                            && !user.getPasswordExpiresAt().isAfter(LocalDateTime.now());

                    if (mustChange && !tempExpired && TokenService.PASSWORD_CHANGE.equals(tokenUse)) {
                        SecurityContextHolderHelper.authenticate(user.getEmail(), "ROLE_PASSWORD_CHANGE");
                    } else if (!mustChange && TokenService.ACCESS.equals(tokenUse)) {
                        SecurityContextHolderHelper.authenticate(user.getEmail(), "ROLE_" + user.getRole().name());
                    }
                }
            } catch (JwtException | IllegalArgumentException ex) {
                // Invalid/expired tokens do not authenticate the request.
            } catch (Exception ex) {
                // Fail closed: never create an authenticated context when token/user validation fails.
            }
        }
        filterChain.doFilter(request, response);
    }
}
