
package com.smartperformance.auth.service;

import com.smartperformance.auth.dto.*;
import com.smartperformance.auth.entity.PasswordResetToken;
import com.smartperformance.auth.entity.Role;
import com.smartperformance.auth.entity.User;
import com.smartperformance.auth.repository.PasswordResetTokenRepository;
import com.smartperformance.auth.repository.UserRepository;
import com.smartperformance.auth.security.TokenService;
import com.smartperformance.exception.BadRequestException;
import com.smartperformance.exception.DuplicateResourceException;
import com.smartperformance.exception.ResourceNotFoundException;
import com.smartperformance.exception.UnauthorizedException;
import com.smartperformance.service.AuditLogService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final long TEMP_PASSWORD_LIFETIME_HOURS = 24;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final TokenService tokenService;
    private final TemporaryPasswordGenerator temporaryPasswordGenerator;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetTokenRepository passwordResetTokenRepository,
            TokenService tokenService,
            TemporaryPasswordGenerator temporaryPasswordGenerator,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.tokenService = tokenService;
        this.temporaryPasswordGenerator = temporaryPasswordGenerator;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {

        String fullName = request.fullName().trim();
        String email = normalizeEmail(request.email());

        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered.");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);
        user.setMustChangePassword(0);
        user.setPasswordExpiresAt(null);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(1);

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                "Registration successful.",
                tokenService.createAccessToken(savedUser.getEmail()),
                savedUser.getUserId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                false
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid email or password."));

        if (user.getIsActive() == null || user.getIsActive() != 1) {
            throw new UnauthorizedException("Account is inactive.");
        }

        if (!passwordEncoder.matches(
                request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        boolean mustChange = user.getMustChangePassword() != null
                && user.getMustChangePassword() == 1;

        if (mustChange) {

            if (user.getPasswordExpiresAt() == null
                    || !user.getPasswordExpiresAt().isAfter(LocalDateTime.now())) {
                throw new UnauthorizedException(
                        "Temporary password has expired. Contact an administrator.");
            }

            String restrictedToken = tokenService.createPasswordChangeToken(
                    user.getEmail(),
                    java.time.Duration.between(
                            LocalDateTime.now(),
                            user.getPasswordExpiresAt()
                    ).toMillis()
            );

            return new AuthResponse(
                    "Temporary password accepted. Change it to continue.",
                    restrictedToken,
                    user.getUserId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    true
            );
        }

        return new AuthResponse(
                "Login successful.",
                tokenService.createAccessToken(user.getEmail()),
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                false
        );
    }

    // ---------------------------------------------------------
    // CREATE TRAINER + AUDIT
    // ---------------------------------------------------------

    @Transactional
    public CreateTrainerResponse createTrainer(CreateTrainerRequest request) {

        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt =
                now.plusHours(TEMP_PASSWORD_LIFETIME_HOURS);

        String temporaryPassword = temporaryPasswordGenerator.generate();

        User trainer = new User();
        trainer.setFullName(request.fullName().trim());
        trainer.setEmail(email);
        trainer.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        trainer.setRole(Role.TRAINER);
        trainer.setMustChangePassword(1);
        trainer.setPasswordExpiresAt(expiresAt);
        trainer.setCreatedAt(now);
        trainer.setUpdatedAt(now);
        trainer.setIsActive(1);

        User saved = userRepository.save(trainer);

        // Never include the temporary password in the audit log.
        auditLogService.record(
                "CREATE_TRAINER",
                "TRAINER",
                saved.getUserId(),
                "Created trainer account: " + saved.getFullName(),
                null,
                "{\"active\":1,\"role\":\"TRAINER\"}"
        );

        // The temporary password is returned only in the original response.
        return new CreateTrainerResponse(
                "Trainer created. Share this temporary password securely; it is shown only once.",
                saved.getUserId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole().name(),
                temporaryPassword,
                expiresAt.toString()
        );
    }

    @Transactional
    public String changeTemporaryPassword(
            String authenticatedEmail,
            ChangeTemporaryPasswordRequest request) {

        User user = userRepository.findByEmail(
                        normalizeEmail(authenticatedEmail))
                .orElseThrow(() ->
                        new UnauthorizedException("User account not found."));

        if (user.getIsActive() == null || user.getIsActive() != 1) {
            throw new UnauthorizedException("Account is inactive.");
        }

        if (user.getMustChangePassword() == null
                || user.getMustChangePassword() != 1) {
            throw new BadRequestException(
                    "This account does not require a temporary password change. Please log in again if needed.");
        }

        if (user.getPasswordExpiresAt() == null
                || !user.getPasswordExpiresAt().isAfter(LocalDateTime.now())) {
            throw new UnauthorizedException(
                    "Temporary password has expired. Contact an administrator.");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        if (passwordEncoder.matches(
                request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException(
                    "Choose a password different from the temporary password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(0);
        user.setPasswordExpiresAt(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return "Password changed successfully. Please log in again with your new password.";
    }

    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() ->
                        new BadRequestException("Email not registered."));

        String token = UUID.randomUUID().toString();

        PasswordResetToken reset = new PasswordResetToken();
        reset.setUser(user);
        reset.setResetToken(token);
        reset.setExpiryTime(LocalDateTime.now().plusMinutes(15));
        reset.setUsed(0);

        passwordResetTokenRepository.save(reset);

        // Existing development-only reset flow.
        return Map.of(
                "message", "Reset token generated for development.",
                "resetToken", token
        );
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {

        PasswordResetToken reset =
                passwordResetTokenRepository.findByResetToken(request.token())
                        .orElseThrow(() ->
                                new BadRequestException("Invalid reset token."));

        if (reset.getUsed() == 1) {
            throw new BadRequestException("Reset token already used.");
        }

        if (reset.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired.");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        User user = reset.getUser();

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(0);
        user.setPasswordExpiresAt(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        reset.setUsed(1);
        passwordResetTokenRepository.save(reset);

        return "Password reset successful.";
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    @Transactional(readOnly = true)
    public List<TrainerResponse> getTrainers() {

        return userRepository.findByRole(Role.TRAINER)
                .stream()
                .map(user -> new TrainerResponse(
                        user.getUserId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getIsActive()
                ))
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // CHANGE TRAINER STATUS + AUDIT
    // ---------------------------------------------------------

    @Transactional
    public TrainerResponse changeTrainerStatus(Long id, Integer active) {

        if (active == null || (active != 0 && active != 1)) {
            throw new BadRequestException(
                    "Status must be 1 (active) or 0 (inactive).");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trainer not found: " + id));

        if (user.getRole() != Role.TRAINER) {
            throw new ResourceNotFoundException("Trainer not found: " + id);
        }

        Integer previousStatus = user.getIsActive();

        if (!Objects.equals(previousStatus, active)) {

            user.setIsActive(active);
            user.setUpdatedAt(LocalDateTime.now());

            User saved = userRepository.save(user);

            String action = active == 0
                    ? "DEACTIVATE_TRAINER"
                    : "REACTIVATE_TRAINER";

            String description = (active == 0
                    ? "Deactivated trainer: "
                    : "Reactivated trainer: ")
                    + saved.getFullName();

            auditLogService.record(
                    action,
                    "TRAINER",
                    saved.getUserId(),
                    description,
                    "{\"active\":" + previousStatus + "}",
                    "{\"active\":" + active + "}"
            );

            return new TrainerResponse(
                    saved.getUserId(),
                    saved.getFullName(),
                    saved.getEmail(),
                    saved.getIsActive()
            );
        }

        return new TrainerResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getIsActive()
        );
    }
}
