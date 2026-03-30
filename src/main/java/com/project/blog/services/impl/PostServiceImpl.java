package com.project.blog.services.impl;

import com.project.blog.domain.PostStatus;
import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.Tag;
import com.project.blog.repositories.PostRepository;
import com.project.blog.services.CategoryService;
import com.project.blog.services.PostService;
import com.project.blog.services.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryService categoryService;
    private final TagService tagService;

    @Override
    @Transactional(readOnly = true)
    public List<Post> getAllPosts(UUID categoryID, UUID tagID) {

        if(categoryID != null && tagID != null)  {
            Category category = categoryService.getCategoryById(categoryID);
            Tag tag = tagService.getTagById(tagID);
            return postRepository.findAllByStatusAndCategoryAndTagsContaining(PostStatus.PUBLISHED, category, tag);
        }

        if(categoryID != null) {
            Category category = categoryService.getCategoryById(categoryID);
            return postRepository.findAllByStatusAndCategory(PostStatus.PUBLISHED, category);

        }

        if(tagID != null) {
            Tag tag = tagService.getTagById(tagID);
            return postRepository.findAllByStatusAndTagsContaining(PostStatus.PUBLISHED, tag);
        }

    return postRepository.findAllByStatus(PostStatus.PUBLISHED);

    }
}
