package com.project.blog.services;

import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.User;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<Category> listCategories(User owner);

    Category createCategory(Category category, User owner);

    Category updateCategory(UUID id, User owner, String newName);

    void deleteCategory(UUID id, User owner);

    Category getCategoryById(UUID id, User owner);
}
