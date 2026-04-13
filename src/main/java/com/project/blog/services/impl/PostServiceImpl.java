package com.project.blog.services.impl;

import com.project.blog.domain.CreatePostRequest;
import com.project.blog.domain.PostStatus;
import com.project.blog.domain.UpdatePostRequest;
import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;
import com.project.blog.repositories.PostRepository;
import com.project.blog.services.CategoryService;
import com.project.blog.services.PostService;
import com.project.blog.services.TagService;
import jakarta.persistence.EntityNotFoundException;
import com.project.blog.security.BlogUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryService categoryService;
    private final TagService tagService;
    private static final int WORDS_PER_MINUTE = 200;

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

    @Override
    @Transactional(readOnly = true)
    public List<Post> getDraftPost(User user) {
        return postRepository.findAllByAuthorAndStatus(user, PostStatus.DRAFT);
    }

    @Override
    @Transactional
    public Post createPost(User user, CreatePostRequest createPostRequest) {
        Post newPost = new Post();
        newPost.setTitle(createPostRequest.getTitle());
        newPost.setContent(createPostRequest.getContent());
        newPost.setStatus(createPostRequest.getPostStatus());
        newPost.setAuthor(user);
        newPost.setReadingTime(calculateReadingTime(createPostRequest.getContent()));

        Category category =  categoryService.getCategoryById(createPostRequest.getCategoryID());
        newPost.setCategory(category);

        Set<UUID> tagIDs = createPostRequest.getTagIDs();
        List<Tag> tags = tagService.getTagByIds(tagIDs);
        newPost.setTags(new HashSet<>(tags));

        return postRepository.save(newPost);

    }

    private static final String POST_NOT_FOUND = "Post not found with id: ";

    @Override
    @Transactional(readOnly = true)
    public Post getPostById(UUID id, UUID viewerUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(POST_NOT_FOUND + id));
        if (post.getStatus() == PostStatus.PUBLISHED) {
            return post;
        }
        if (viewerUserId != null && viewerUserId.equals(post.getAuthor().getId())) {
            return post;
        }
        throw new EntityNotFoundException(POST_NOT_FOUND + id);
    }

    @Transactional
    @Override
    public Post updatePost(UUID id, UpdatePostRequest updatePostRequest) {
        UUID actorUserId = requireCurrentUserId();
        Post existingPost = requireOwnedPost(id, actorUserId);

        if (updatePostRequest.getTitle() != null) {
            existingPost.setTitle(updatePostRequest.getTitle());
        }

        if (updatePostRequest.getContent() != null) {
            existingPost.setContent(updatePostRequest.getContent());
            existingPost.setReadingTime(calculateReadingTime(updatePostRequest.getContent()));
        }

        if (updatePostRequest.getPostStatus() != null) {
            existingPost.setStatus(updatePostRequest.getPostStatus());
        }

        UUID updatePostRequestCategoryID = updatePostRequest.getCategoryID();
        if (updatePostRequestCategoryID != null &&
                !updatePostRequestCategoryID.equals(existingPost.getCategory().getId())) {
            Category category = categoryService.getCategoryById(updatePostRequestCategoryID);
            existingPost.setCategory(category);
        }

        Set<UUID> updatePostRequestTagIds = updatePostRequest.getTagIDs();
        if (updatePostRequestTagIds != null) {
            Set<UUID> existingTagIDs = existingPost.getTags().stream()
                    .map(Tag::getId)
                    .collect(Collectors.toSet());
            if (!existingTagIDs.equals(updatePostRequestTagIds)) {
                List<Tag> newTags = tagService.getTagByIds(updatePostRequestTagIds);
                existingPost.setTags(new HashSet<>(newTags));
            }
        }

        return postRepository.save(existingPost);
    }

    @Transactional
    @Override
    public void deletePost(UUID id) {
        UUID actorUserId = requireCurrentUserId();
        Post post = requireOwnedPost(id, actorUserId);
        postRepository.delete(post);
    }

    private static UUID requireCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof BlogUserDetails details)) {
            throw new AccessDeniedException("Not authenticated");
        }
        return details.getId();
    }

    private Post requireOwnedPost(UUID id, UUID actorUserId) {
        Optional<Post> owned = postRepository.findByIdAndAuthor_Id(id, actorUserId);
        if (owned.isPresent()) {
            return owned.get();
        }
        if (!postRepository.existsById(id)) {
            throw new EntityNotFoundException(POST_NOT_FOUND + id);
        }
        throw new AccessDeniedException("You can only modify your own posts");
    }

    private Integer calculateReadingTime(String Content) {
        if(Content == null || Content.isEmpty()) {
            return 0;
        }
        int wordCount = Content.trim().split("\\s").length;
        return (int)Math.ceil( (double)wordCount/WORDS_PER_MINUTE);

    }

}
