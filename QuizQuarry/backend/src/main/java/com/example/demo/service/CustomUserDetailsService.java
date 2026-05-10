package com.example.demo.service;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final SystemUserRepository repo;
    public CustomUserDetailsService(SystemUserRepository repo) { this.repo = repo; }
    @Override public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repo.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
