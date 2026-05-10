package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="otp_token")
@Data @NoArgsConstructor @AllArgsConstructor
public class OtpToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String otp;
    private LocalDateTime expiryDate;
    
    // Store registration data temporarily
    private String fullName;
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private SystemUser.Role role;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
