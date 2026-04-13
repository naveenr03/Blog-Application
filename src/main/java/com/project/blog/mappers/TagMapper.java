package com.project.blog.mappers;

import com.project.blog.domain.dtos.TagResponse;
import com.project.blog.domain.entities.Tag;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {

    public TagResponse toTagResponse(Tag tag) {
        if (tag == null) {
            return null;
        }
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .postCount((int) tag.getPostCount())
                .build();
    }
}
