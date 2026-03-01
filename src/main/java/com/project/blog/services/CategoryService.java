package com.project.blog.services;

import com.project.blog.domain.dtos.CategoryDto;
import com.project.blog.domain.entities.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<Category> listCategories();

    Category createCategory(Category category);

    void delteCategory(UUID id);
}
