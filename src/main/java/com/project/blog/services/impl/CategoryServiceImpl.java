package com.project.blog.services.impl;

import com.project.blog.domain.entities.Category;
import com.project.blog.domain.entities.User;
import com.project.blog.repositories.CategoryRepository;
import com.project.blog.services.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> listCategories(User owner) {
        return categoryRepository.findAllByOwnerFetchPosts(owner);
    }

    @Override
    @Transactional
    public Category createCategory(Category category, User owner) {
        category.setOwner(owner);
        String name = category.getName().trim();
        category.setName(name);
        if (categoryRepository.existsByOwnerAndNameIgnoreCase(owner, name)) {
            throw new IllegalArgumentException("Category with name " + name + " already exists");
        }
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(UUID id, User owner, String newName) {
        Category category = categoryRepository.findByIdAndOwner_Id(id, owner.getId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        String trimmed = newName.trim();
        if (!category.getName().equalsIgnoreCase(trimmed)
                && categoryRepository.existsByOwnerAndNameIgnoreCase(owner, trimmed)) {
            throw new IllegalArgumentException("Category with name " + trimmed + " already exists");
        }
        category.setName(trimmed);
        categoryRepository.save(category);
        return categoryRepository.findByIdAndOwner_IdFetchPosts(id, owner.getId())
                .orElse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id, User owner) {
        Optional<Category> category = categoryRepository.findByIdAndOwner_Id(id, owner.getId());
        if (category.isEmpty()) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        Category c = category.get();
        if (!c.getPosts().isEmpty()) {
            throw new IllegalStateException("Category with id " + id + " has posts");
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public Category getCategoryById(UUID id, User owner) {
        return categoryRepository.findByIdAndOwner_Id(id, owner.getId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
    }
}
