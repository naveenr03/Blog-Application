package com.project.blog.repositories;

import com.project.blog.domain.entities.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_returnsSavedUser() {
        User user = User.builder()
                .email("jpa-test@example.com")
                .password("{noop}encoded")
                .name("Jpa")
                .build();
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("jpa-test@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Jpa");
        assertThat(found.get().getId()).isNotNull();
    }
}
