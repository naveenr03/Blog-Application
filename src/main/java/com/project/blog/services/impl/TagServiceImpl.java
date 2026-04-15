package com.project.blog.services.impl;

import com.project.blog.domain.entities.Tag;
import com.project.blog.domain.entities.User;
import com.project.blog.repositories.TagRepository;
import com.project.blog.services.TagService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public List<Tag> getTags(User owner) {
        return tagRepository.findAllByOwnerOrderByNameAsc(owner);
    }

    @Transactional
    @Override
    public List<Tag> createTags(Set<String> tagNames, User owner) {
        Set<String> normalized = tagNames.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toCollection(HashSet::new));

        if (normalized.isEmpty()) {
            return List.of();
        }

        List<Tag> existingTags = tagRepository.findByOwnerAndNameIn(owner, normalized);

        Set<String> existingNames = existingTags.stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());

        List<Tag> newTags = normalized.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> Tag.builder()
                        .name(name)
                        .owner(owner)
                        .posts(new HashSet<>())
                        .build())
                .toList();

        List<Tag> savedNew = newTags.isEmpty() ? new ArrayList<>() : tagRepository.saveAll(newTags);

        List<Tag> result = new ArrayList<>(existingTags);
        result.addAll(savedNew);
        result.sort((a, b) -> a.getName().compareToIgnoreCase(b.getName()));
        return result;
    }

    @Transactional
    @Override
    public void deleteTag(UUID id, User owner) {
        Optional<Tag> tag = tagRepository.findByIdAndOwner_Id(id, owner.getId());
        if (tag.isEmpty()) {
            throw new EntityNotFoundException("Tag not found with id: " + id);
        }
        Tag t = tag.get();
        if (!t.getPosts().isEmpty()) {
            throw new IllegalStateException("Cannot delete tag with posts");
        }
        tagRepository.deleteById(id);
    }

    @Override
    public Tag getTagById(UUID id, User owner) {
        return tagRepository.findByIdAndOwner_Id(id, owner.getId())
                .orElseThrow(() -> new EntityNotFoundException("Tag not found with id: " + id));
    }

    @Override
    public List<Tag> getTagByIds(Set<UUID> ids, User owner) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        List<Tag> found = tagRepository.findAllByOwnerAndIdIn(owner, ids);
        if (found.size() != ids.size()) {
            throw new EntityNotFoundException("Not all specified tag IDs exist or belong to you");
        }
        return found;
    }
}
