package com.project.blog.controllers;


import com.project.blog.domain.dtos.AuthResponse;
import com.project.blog.domain.dtos.LoginRequest;
import com.project.blog.domain.dtos.RegisterRequestDto;
import com.project.blog.services.AuthenticationService;
import com.project.blog.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @PostMapping(path = "/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        UserDetails userDetails = authenticationService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword());

        String tokenValue = authenticationService.generateToken(userDetails);
        return ResponseEntity.ok(buildAuthResponse(tokenValue));
    }

    @PostMapping(path = "/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequestDto registerRequestDto) {
        userService.register(registerRequestDto);
        UserDetails userDetails = userDetailsService.loadUserByUsername(registerRequestDto.getEmail().trim().toLowerCase());
        String tokenValue = authenticationService.generateToken(userDetails);
        return new ResponseEntity<>(buildAuthResponse(tokenValue), HttpStatus.CREATED);
    }

    private AuthResponse buildAuthResponse(String tokenValue) {
        return AuthResponse.builder()
                .token(tokenValue)
                .expiresIn(jwtExpirationMs / 1000)
                .build();
    }

}
