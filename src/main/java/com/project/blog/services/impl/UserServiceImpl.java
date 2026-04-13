package com.project.blog.services.impl;

import com.project.blog.domain.dtos.RegisterRequestDto;
import com.project.blog.domain.entities.User;
import com.project.blog.repositories.UserRepository;
import com.project.blog.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getUserById(UUID id) {

        return userRepository.findById(id)
                .orElseThrow(() ->  new EntityNotFoundException("User not found"));

    }

    @Override
    @Transactional
    public User register(RegisterRequestDto dto) {
        String normalizedEmail = dto.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        User user = User.builder()
                .name(dto.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();
        return userRepository.save(user);
    }
}
