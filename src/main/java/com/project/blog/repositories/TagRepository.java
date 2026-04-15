package com.project.blog.repositories;


import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    List<Tag> findAllByOwnerOrderByNameAsc(User owner);

    List<Tag> findByOwnerAndNameIn(User owner, Set<String> tagNames);

    Optional<Tag> findByIdAndOwner_Id(UUID id, UUID ownerId);

    List<Tag> findAllByOwnerAndIdIn(User owner, Collection<UUID> ids);

}
