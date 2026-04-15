package com.project.blog.domain.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.blog.domain.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequestDto {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between {min} and {max} characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 50000, message = "Content must be between {min} and {max} characters")
    private String content;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @Size(max = 10, message = "Maximum {max} tags allowed")
    @JsonProperty("tagIds")
    private Set<UUID> tagIDs = new HashSet<>();

    @NotNull(message = "Status is required")
    private PostStatus status;

    @JsonProperty("entryDate")
    private LocalDate entryDate;

}
