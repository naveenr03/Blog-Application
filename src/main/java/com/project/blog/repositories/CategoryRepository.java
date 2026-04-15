package com.project.blog.repositories;


import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.posts WHERE c.owner = :owner")
    List<Category> findAllByOwnerFetchPosts(@Param("owner") User owner);

    boolean existsByOwnerAndNameIgnoreCase(User owner, String name);

    Optional<Category> findByIdAndOwner_Id(UUID id, UUID ownerId);

    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.posts WHERE c.id = :id AND c.owner.id = :ownerId")
    Optional<Category> findByIdAndOwner_IdFetchPosts(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

}
