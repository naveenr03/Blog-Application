package com.project.blog.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePostRequest {
    private String title;

    private String content;

    private UUID categoryID;

    private Set<UUID> tagIDs = new HashSet<>();

    private PostStatus postStatus;

    private LocalDate entryDate;
}
