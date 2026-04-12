package com.project.blog.services.impl;

import com.project.blog.domain.entities.User;
import com.project.blog.repositories.UserRepository;
import com.project.blog.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getUserById(UUID id) {

        return userRepository.findById(id)
                .orElseThrow(() ->  new EntityNotFoundException("User not found"));

    }
}
