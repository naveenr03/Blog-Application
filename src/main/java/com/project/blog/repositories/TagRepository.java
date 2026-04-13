package com.project.blog.repositories;


import com.project.blog.domain.entities.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    List<Tag> findAllByOrderByNameAsc();

    List<Tag> findByNameIn(Set<String> tagNames);

}
