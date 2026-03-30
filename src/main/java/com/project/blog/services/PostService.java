package com.project.blog.services;

import com.project.blog.domain.entities.Post;

import java.util.List;
import java.util.UUID;

public interface PostService {

    List<Post> getAllPosts(UUID categoryID, UUID tagID);

}

