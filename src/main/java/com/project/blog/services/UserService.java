package com.project.blog.services;

import com.project.blog.domain.dtos.RegisterRequestDto;
import com.project.blog.domain.entities.User;

import java.util.UUID;

public interface UserService {

    User getUserById(UUID id);

    User register(RegisterRequestDto dto);
}
