package com.project.blog.services;

import com.project.blog.domain.CreatePostRequest;
import com.project.blog.domain.UpdatePostRequest;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.User;

import java.util.List;
import java.util.UUID;

public interface PostService {

    List<Post> getAllPosts(UUID categoryID, UUID tagID);

    List<Post> getDraftPost(User user);

    Post createPost(User user, CreatePostRequest createPostRequest);

    Post getPostById(UUID id);

    Post updatePost(UUID id, UpdatePostRequest updatePostRequest);

    void deletePost(UUID id);

}
