package com.project.blog.mappers;


import com.project.blog.domain.CreatePostRequest;
import com.project.blog.domain.dtos.CreatePostRequestDto;
import com.project.blog.domain.dtos.PostDto;
import com.project.blog.domain.entities.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PostMapper {

    @Mapping(target = "author", source = "author")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "tags", source = "tags")
    PostDto toDto(Post post);

    @Mapping(target = "categoryID", source = "categoryId")
    @Mapping(target = "postStatus", source = "status")
    CreatePostRequest toCreatePostRequest(CreatePostRequestDto dto);

}
