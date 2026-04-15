package com.project.blog.services;

import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TagService {

    List<Tag> getTags(User owner);

    List<Tag> createTags(Set<String> tagNames, User owner);

    void deleteTag(UUID id, User owner);

    Tag getTagById(UUID id, User owner);

    List<Tag> getTagByIds(Set<UUID> ids, User owner);
}
