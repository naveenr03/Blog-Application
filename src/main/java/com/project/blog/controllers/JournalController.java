package com.project.blog.controllers;

import com.project.blog.domain.dtos.JournalCalendarResponse;
import com.project.blog.domain.entities.User;
import com.project.blog.security.BlogUserDetails;
import com.project.blog.services.PostService;
import com.project.blog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/journal")
@RequiredArgsConstructor
public class JournalController {

    private final PostService postService;
    private final UserService userService;

    @GetMapping("/calendar")
    public ResponseEntity<JournalCalendarResponse> getCalendar(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(postService.getJournalCalendar(user, year, month));
    }
}
