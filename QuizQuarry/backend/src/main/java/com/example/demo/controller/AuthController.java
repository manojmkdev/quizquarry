package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService svc;

    public AuthController(AuthService svc) {
        this.svc = svc;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        return svc.login(req);
    }

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest req) {
        svc.register(req);
    }

    @PostMapping("/verify-otp")
    public void verify(@RequestBody java.util.Map<String, String> body) {
        svc.verifyOtp(body.get("email"), body.get("otp"));
    }
}

