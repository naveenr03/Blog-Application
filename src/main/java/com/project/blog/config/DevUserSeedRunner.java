package com.project.blog.config;

import com.project.blog.domain.entities.User;
import com.project.blog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a default login user when the {@code dev} profile is active.
 * Override credentials with {@code dev.seed-user.*} or {@code DEV_SEED_USER_PASSWORD}.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevUserSeedRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${dev.seed-user.email}")
    private String email;

    @Value("${dev.seed-user.name}")
    private String name;

    @Value("${dev.seed-user.password}")
    private String plainPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        User newUser = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(plainPassword))
                .build();
        userRepository.save(newUser);
    }
}
