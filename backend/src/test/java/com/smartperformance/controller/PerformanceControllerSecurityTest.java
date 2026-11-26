package com.smartperformance.controller;

import com.smartperformance.auth.entity.Role;
import com.smartperformance.auth.entity.User;
import com.smartperformance.auth.repository.UserRepository;
import com.smartperformance.auth.security.SecurityConfig;
import com.smartperformance.auth.security.TokenService;
import com.smartperformance.dto.PerformanceResponse;
import com.smartperformance.service.PerformanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PerformanceController.class)
@Import({SecurityConfig.class, TokenService.class})
@TestPropertySource(properties = {
        "app.jwt.secret=test-secret-test-secret-test-secret-1234",
        "app.jwt.expiration-ms=3600000"
})
class PerformanceControllerSecurityTest {

    @Autowired MockMvc mvc;
    @Autowired TokenService tokenService;

    @MockitoBean PerformanceService performanceService;
    @MockitoBean UserRepository userRepository;

    private static final String VALID_BODY = """
            {"studentId":1,"attendance":80,"assignmentScore":70,"testScore":75,"projectScore":90}
            """;

    @BeforeEach
    void setUpUsers() {
        stubUser("trainer@test.com", Role.TRAINER);
        stubUser("student@test.com", Role.STUDENT);
        stubUser("admin@test.com", Role.ADMIN);
    }

    private void stubUser(String email, Role role) {
        User user = mock(User.class);
        when(user.getEmail()).thenReturn(email);
        when(user.getRole()).thenReturn(role);
        when(user.getIsActive()).thenReturn(1);
        when(user.getMustChangePassword()).thenReturn(0);
        when(user.getPasswordExpiresAt()).thenReturn(null);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
    }

    private String bearer(String email) {
        return "Bearer " + tokenService.createAccessToken(email);
    }

    @Test
    void noToken_returns401() throws Exception {
        mvc.perform(get("/api/performance")).andExpect(status().isUnauthorized());
    }

    @Test
    void garbageToken_returns401() throws Exception {
        mvc.perform(get("/api/performance").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentRole_returns403() throws Exception {
        mvc.perform(get("/api/performance").header("Authorization", bearer("student@test.com")))
                .andExpect(status().isForbidden());
    }

    @Test
    void trainerRole_returns200() throws Exception {
        when(performanceService.getAll()).thenReturn(List.of());

        mvc.perform(get("/api/performance").header("Authorization", bearer("trainer@test.com")))
                .andExpect(status().isOk());
    }

    @Test
    void adminRole_returns200() throws Exception {
        when(performanceService.getAll()).thenReturn(List.of());

        mvc.perform(get("/api/performance").header("Authorization", bearer("admin@test.com")))
                .andExpect(status().isOk());
    }

    @Test
    void passwordChangeToken_cannotAccessData() throws Exception {
        String restricted = "Bearer " + tokenService.createPasswordChangeToken("trainer@test.com", 600_000L);

        mvc.perform(get("/api/performance").header("Authorization", restricted))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidScore_returns400() throws Exception {
        String badBody = VALID_BODY.replace("\"attendance\":80", "\"attendance\":150");

        mvc.perform(post("/api/performance")
                        .header("Authorization", bearer("trainer@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validRequest_returns201() throws Exception {
        when(performanceService.create(any())).thenReturn(new PerformanceResponse());

        mvc.perform(post("/api/performance")
                        .header("Authorization", bearer("trainer@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated());
    }
}
