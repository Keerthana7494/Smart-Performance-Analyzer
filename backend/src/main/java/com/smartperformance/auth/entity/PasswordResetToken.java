package com.smartperformance.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PASSWORD_RESET_TOKEN")
@Getter
@Setter
@NoArgsConstructor
//@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "reset_token_seq"
    )
    @SequenceGenerator(
        name = "reset_token_seq",
        sequenceName = "RESET_TOKEN_SEQ",
        allocationSize = 1
    )
    @Column(name = "TOKEN_ID")
    private Long tokenId;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name = "RESET_TOKEN")
    private String resetToken;

    @Column(name = "EXPIRY_TIME")
    private LocalDateTime expiryTime;

    @Column(name = "USED")
    private Integer used;
}