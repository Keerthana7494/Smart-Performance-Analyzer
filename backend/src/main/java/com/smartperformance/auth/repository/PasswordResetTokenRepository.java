package com.smartperformance.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartperformance.auth.entity.*;


public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long>{
Optional<PasswordResetToken> 
findByResetToken(String resetToken);
    
} 
