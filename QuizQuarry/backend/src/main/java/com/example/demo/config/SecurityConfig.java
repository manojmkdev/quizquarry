package com.example.demo.config;

import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final com.example.demo.security.JwtService jwtService;
    private final com.example.demo.repository.SystemUserRepository userRepository;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, 
                         CustomUserDetailsService userDetailsService,
                         com.example.demo.security.JwtService jwtService,
                         com.example.demo.repository.SystemUserRepository userRepository) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth -> oauth
                        .successHandler((request, response, authentication) -> {
                            org.springframework.security.oauth2.core.user.OAuth2User oauthUser = 
                                (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
                            String email = oauthUser.getAttribute("email");
                            String name = oauthUser.getAttribute("name");
                            
                            com.example.demo.entity.SystemUser user = userRepository.findByEmail(email).orElseGet(() -> {
                                com.example.demo.entity.SystemUser newUser = new com.example.demo.entity.SystemUser();
                                newUser.setEmail(email);
                                newUser.setFullName(name);
                                newUser.setRole(com.example.demo.entity.SystemUser.Role.STUDENT);
                                newUser.setPasswordHash("OAUTH2_USER");
                                return userRepository.save(newUser);
                            });

                            String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getEmail(), "", new java.util.ArrayList<>()
                            ));
                            
                            response.sendRedirect("http://localhost:3000/oauth2/callback?token=" + token + "&fullName=" + java.net.URLEncoder.encode(name, "UTF-8") + "&role=" + user.getRole().name());
                        }))

                .build();


    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
