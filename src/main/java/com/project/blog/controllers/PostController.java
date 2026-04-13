package com.project.blog.controllers;


import com.project.blog.domain.CreatePostRequest;
import com.project.blog.domain.UpdatePostRequest;
import com.project.blog.domain.dtos.CreatePostRequestDto;
import com.project.blog.domain.dtos.PostDto;
import com.project.blog.domain.dtos.UpdatePostRequestDto;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.User;
import com.project.blog.mappers.PostMapper;
import com.project.blog.services.PostService;
import com.project.blog.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final PostMapper postMapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(
            @RequestParam(required = false) UUID categoryID,
            @RequestParam(required = false) UUID tagID
    ) {
        List<Post> posts = postService.getAllPosts(categoryID, tagID);
        List<PostDto> postDtos = posts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDtos);

    }

    @GetMapping(path = "/drafts")
    public ResponseEntity<List<PostDto>> getDrafts(@RequestAttribute UUID userId) {
        User loggedInUser = userService.getUserById(userId);
        List<Post> draftPosts = postService.getDraftPost(loggedInUser);
        List<PostDto> postDtos = draftPosts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDtos);
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<PostDto> getPostById(
            @PathVariable UUID id,
            @RequestAttribute(name = "userId", required = false) UUID viewerUserId) {
        Post post = postService.getPostById(id, viewerUserId);
        return ResponseEntity.ok(postMapper.toDto(post));
    }

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody CreatePostRequestDto createPostRequestDto,
            @RequestAttribute UUID userId
    ) {

         User loggedInUser = userService.getUserById(userId);
        CreatePostRequest createPostRequest = postMapper.toCreatePostRequest(createPostRequestDto);
        Post createdPost = postService.createPost(loggedInUser, createPostRequest);
        return new ResponseEntity<>(postMapper.toDto(createdPost), HttpStatus.CREATED);


    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePostRequestDto updatePostRequestDto,
            @RequestAttribute UUID userId
    ) {
        UpdatePostRequest updatePostRequest = postMapper.toUpdatePostRequest(updatePostRequestDto);
        Post updatedPost = postService.updatePost(id, userId, updatePostRequest);
        return ResponseEntity.ok(postMapper.toDto(updatedPost));
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID id,
            @RequestAttribute UUID userId) {
        postService.deletePost(id, userId);
        return ResponseEntity.noContent().build();
    }

}
