package com.project.blog.controllers;


import com.project.blog.domain.dtos.CreateCategoryRequest;
import com.project.blog.domain.dtos.CategoryDto;
import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.User;
import com.project.blog.mappers.CategoryMapper;
import com.project.blog.security.BlogUserDetails;
import com.project.blog.services.CategoryService;
import com.project.blog.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> listCategories(@AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        List<CategoryDto> categories = categoryService.listCategories(user)
                .stream().map(categoryMapper::toDto).toList();
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @Valid @RequestBody CreateCategoryRequest createCategoryRequest,
            @AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        Category categoryToCreate = categoryMapper.toEntity(createCategoryRequest);
        Category savedCategory = categoryService.createCategory(categoryToCreate, user);
        return new ResponseEntity<>(
                categoryMapper.toDto(savedCategory),
                HttpStatus.CREATED
        );
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCategoryRequest body,
            @AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        Category updated = categoryService.updateCategory(id, user, body.getName());
        return ResponseEntity.ok(categoryMapper.toDto(updated));
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable UUID id,
            @AuthenticationPrincipal BlogUserDetails principal) {
        User user = userService.getUserById(principal.getId());
        categoryService.deleteCategory(id, user);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
