package com.project.blog.controllers;

import com.project.blog.domain.dtos.CreateTagsRequest;
import com.project.blog.domain.dtos.TagResponse;
import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;
import com.project.blog.mappers.TagMapper;
import com.project.blog.security.BlogUserDetails;
import com.project.blog.services.TagService;
import com.project.blog.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final TagMapper tagMapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags(@AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        List<Tag> tags = tagService.getTags(user);
        List<TagResponse> tagResponses = tags.stream().map(tagMapper::toTagResponse).toList();
        return ResponseEntity.ok(tagResponses);
    }

    @PostMapping
    public ResponseEntity<List<TagResponse>> createTags(
            @Valid @RequestBody CreateTagsRequest createTagsRequest,
            @AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        List<Tag> savedTags = tagService.createTags(createTagsRequest.getNames(), user);
        List<TagResponse> createdTagResponses = savedTags.stream().map(tagMapper::toTagResponse).toList();
        return new ResponseEntity<>(createdTagResponses, HttpStatus.CREATED);
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deleteTag(
            @PathVariable UUID id,
            @AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        tagService.deleteTag(id, user);
        return ResponseEntity.noContent().build();
    }

}
