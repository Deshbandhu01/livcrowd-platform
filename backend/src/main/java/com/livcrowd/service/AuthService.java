package com.livcrowd.service;

import com.livcrowd.dto.AuthRequest;
import com.livcrowd.dto.AuthResponse;
import com.livcrowd.model.Role;
import com.livcrowd.model.User;
import com.livcrowd.repository.UserRepository;
import com.livcrowd.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole().name());
                return new AuthResponse(token, user.getUsername(), user.getRole().name());
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    public void register(AuthRequest request, String email) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);
    }
}
