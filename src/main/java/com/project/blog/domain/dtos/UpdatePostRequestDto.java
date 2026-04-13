package com.project.blog.domain.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.blog.domain.PostStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePostRequestDto {

    @NotNull(message = "Post ID is required")
    private UUID id;

    @Size(min = 3, max = 200, message = "Title must be between {min} and {max} characters")
    private String title;

    @Size(min = 10, max = 50000, message = "Content must be between {min} and {max} characters")
    private String content;

    @JsonProperty("categoryId")
    private UUID categoryID;

    @Size(max = 10, message = "Maximum {max} tags allowed")
    @JsonProperty("tagIds")
    private Set<UUID> tagIDs = new HashSet<>();

    private PostStatus status;

}
