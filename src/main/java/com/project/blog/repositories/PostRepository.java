package com.project.blog.repositories;


import com.project.blog.domain.PostStatus;
import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID>, JpaSpecificationExecutor<Post> {

    List<Post> findAllByStatusAndCategoryAndTagsContaining(PostStatus status, Category category, Tag tag);

    List<Post> findAllByStatusAndCategory(PostStatus status, Category category);

    List<Post> findAllByStatusAndTagsContaining(PostStatus status, Tag tag);

    List<Post> findAllByStatus(PostStatus status);

    List<Post> findAllByAuthorAndStatus(User Author, PostStatus status);

    List<Post> findAllByAuthorAndEntryDateBetweenOrderByEntryDateAscUpdatedAtDesc(
            User author, LocalDate startInclusive, LocalDate endInclusive);

    Optional<Post> findByIdAndAuthor_Id(UUID id, UUID authorId);

    @Query("""
            SELECT DISTINCT p FROM Post p
            LEFT JOIN p.tags st
            WHERE p.status = :status
            AND (
                LOWER(p.Title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(st.name) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            AND (:category IS NULL OR p.category = :category)
            AND (:tag IS NULL OR :tag MEMBER OF p.tags)
            """)
    List<Post> searchPublished(
            @Param("status") PostStatus status,
            @Param("search") String search,
            @Param("category") Category category,
            @Param("tag") Tag tag);

}
