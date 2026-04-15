package com.project.blog.services;

import com.project.blog.domain.CreatePostRequest;
import com.project.blog.domain.UpdatePostRequest;
import com.project.blog.domain.dtos.JournalCalendarResponse;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.User;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PostService {

    List<Post> getAllPosts(UUID categoryID, UUID tagID, String search, User author, LocalDate entryDate);

    JournalCalendarResponse getJournalCalendar(User author, int year, int month);

    List<Post> getDraftPost(User user);

    Post createPost(User user, CreatePostRequest createPostRequest);

    Post getPostById(UUID id, UUID viewerUserId);

    Post updatePost(UUID id, UpdatePostRequest updatePostRequest);

    void deletePost(UUID id);

}
