package com.project.blog.mappers;


import com.project.blog.domain.CreatePostRequest;
import com.project.blog.domain.PostStatus;
import com.project.blog.domain.UpdatePostRequest;
import com.project.blog.domain.dtos.CategoryDto;
import com.project.blog.domain.dtos.CreatePostRequestDto;
import com.project.blog.domain.dtos.PostDto;
import com.project.blog.domain.dtos.TagResponse;
import com.project.blog.domain.dtos.UpdatePostRequestDto;
import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.Post;
import com.project.blog.domain.entities.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PostMapper {

    @Mapping(target = "author", source = "author")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "tags", source = "tags")
    PostDto toDto(Post post);

    @Mapping(target = "postCount", source = "posts", qualifiedByName = "categoryPostCount")
    CategoryDto categoryToDto(Category category);

    @Mapping(target = "postCount", source = "posts", qualifiedByName = "tagPostCount")
    TagResponse tagToTagResponse(Tag tag);

    @Mapping(target = "categoryID", source = "categoryId")
    @Mapping(target = "postStatus", source = "status")
    @Mapping(target = "entryDate", source = "entryDate")
    CreatePostRequest toCreatePostRequest(CreatePostRequestDto dto);

    @Mapping(target = "postStatus", source = "status")
    @Mapping(target = "entryDate", source = "entryDate")
    UpdatePostRequest toUpdatePostRequest(UpdatePostRequestDto dto);

    @Named("categoryPostCount")
    default long categoryPostCount(List<Post> posts) {
        if (posts == null) return 0;
        return posts.stream()
                .filter(p -> PostStatus.PUBLISHED.equals(p.getStatus()))
                .count();
    }

    @Named("tagPostCount")
    default int tagPostCount(Set<Post> posts) {
        if (posts == null) return 0;
        return (int) posts.stream()
                .filter(p -> PostStatus.PUBLISHED.equals(p.getStatus()))
                .count();
    }
}
