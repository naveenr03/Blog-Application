package com.project.blog.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.blog.domain.dtos.LoginRequest;
import com.project.blog.domain.dtos.RegisterRequestDto;
import com.project.blog.domain.entities.User;
import com.project.blog.security.BlogUserDetails;
import com.project.blog.services.AuthenticationService;
import com.project.blog.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthenticationService authenticationService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void loginReturnsTokenAndUser() throws Exception {
        User user = testUser();
        BlogUserDetails details = new BlogUserDetails(user);
        when(authenticationService.authenticate(eq("a@b.com"), eq("secret")))
                .thenReturn(details);
        when(authenticationService.generateToken(details)).thenReturn("jwt-token");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                LoginRequest.builder().email("a@b.com").password("secret").build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.expiresIn").value(28800))
                .andExpect(jsonPath("$.userId").value(user.getId().toString()))
                .andExpect(jsonPath("$.email").value("a@b.com"))
                .andExpect(jsonPath("$.name").value("Alice"));
    }

    @Test
    void registerReturns201AndToken() throws Exception {
        RegisterRequestDto body = RegisterRequestDto.builder()
                .name("Bob")
                .email("bob@example.com")
                .password("password12")
                .build();
        User user = User.builder()
                .email("bob@example.com")
                .password("{noop}x")
                .name("Bob")
                .build();
        user.setId(UUID.randomUUID());
        BlogUserDetails details = new BlogUserDetails(user);

        when(userDetailsService.loadUserByUsername("bob@example.com")).thenReturn(details);
        when(authenticationService.generateToken(details)).thenReturn("new-jwt");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("new-jwt"))
                .andExpect(jsonPath("$.userId").value(user.getId().toString()));

        verify(userService).register(any(RegisterRequestDto.class));
    }

    @Test
    void registerValidationErrorReturns400() throws Exception {
        RegisterRequestDto body = RegisterRequestDto.builder()
                .name("")
                .email("not-an-email")
                .password("short")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    private static User testUser() {
        User user = User.builder()
                .email("a@b.com")
                .password("{noop}x")
                .name("Alice")
                .build();
        user.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        return user;
    }
}
