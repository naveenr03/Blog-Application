package com.project.blog.controllers;

import com.project.blog.domain.entities.User;
import com.project.blog.mappers.PostMapper;
import com.project.blog.security.BlogUserDetails;
import com.project.blog.services.PostService;
import com.project.blog.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full application context + real {@code SecurityFilterChain}; mocks only controller collaborators.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PostControllerMockMvcIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PostService postService;

    @MockitoBean
    private PostMapper postMapper;

    @MockitoBean
    private UserService userService;

    @Test
    void getAllPosts_withoutAuth_returns401() throws Exception {
        SecurityContextHolder.clearContext();
        mockMvc.perform(get("/api/v1/posts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllPosts_withAuth_returnsOkAndEmptyArray() throws Exception {
        User user = userWithId();
        BlogUserDetails principal = new BlogUserDetails(user);
        when(userService.getUserById(principal.getId())).thenReturn(user);
        when(postService.getAllPosts(isNull(), isNull(), isNull(), eq(user), isNull()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/posts")
                        .with(authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    private static User userWithId() {
        User user = User.builder()
                .email("writer@example.com")
                .password("{noop}x")
                .name("Writer")
                .build();
        user.setId(UUID.fromString("10000000-0000-0000-0000-000000000001"));
        return user;
    }
}
