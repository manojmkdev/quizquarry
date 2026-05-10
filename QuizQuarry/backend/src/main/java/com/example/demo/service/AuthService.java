package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.entity.SystemUser;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.security.JwtService;
import com.example.demo.repository.OtpTokenRepository;
import com.example.demo.entity.OtpToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final SystemUserRepository repo;
    private final OtpTokenRepository otpRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(SystemUserRepository repo, OtpTokenRepository otpRepo, PasswordEncoder passwordEncoder,
            JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
        this.repo = repo;
        this.otpRepo = otpRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        var user = repo.findByEmail(req.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        AuthResponse res = new AuthResponse();
        res.setToken(jwtToken);
        res.setFullName(user.getFullName());
        res.setRole(user.getRole().name());
        return res;
    }

    @Transactional
    public void register(RegisterRequest req) {
        if (repo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        otpRepo.deleteByEmail(req.getEmail());

        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));

        OtpToken token = new OtpToken();
        token.setEmail(req.getEmail());
        token.setOtp(otp);
        token.setFullName(req.getFullName());
        token.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        token.setRole(SystemUser.Role.valueOf(req.getRole()));
        token.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(10));

        otpRepo.save(token);
        emailService.sendOtp(req.getEmail(), otp);
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        OtpToken token = otpRepo.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (token.isExpired()) {
            otpRepo.delete(token);
            throw new RuntimeException("OTP Expired");
        }

        SystemUser u = new SystemUser();
        u.setEmail(token.getEmail());
        u.setPasswordHash(token.getPasswordHash());
        u.setFullName(token.getFullName());
        u.setRole(token.getRole());
        repo.save(u);

        otpRepo.delete(token);
    }
}
