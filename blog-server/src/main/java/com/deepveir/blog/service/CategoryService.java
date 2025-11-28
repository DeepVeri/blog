package com.deepveir.blog.service;

import com.deepveir.blog.entity.Category;
import com.deepveir.blog.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc();
    }

    public Optional<Category> getCategoryById(UUID id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> getCategoryByCategoryId(String categoryId) {
        return categoryRepository.findByCategoryId(categoryId);
    }

    public Category createCategory(Category category) {
        if (category.getCategoryId() == null || category.getCategoryId().isEmpty()) {
            category.setCategoryId(generateCategoryId(category.getName()));
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        return categoryRepository.save(category);
    }

    public Optional<Category> updateCategory(UUID id, Category categoryDetails) {
        return categoryRepository.findById(id).map(category -> {
            if (categoryDetails.getName() != null) {
                category.setName(categoryDetails.getName());
            }
            if (categoryDetails.getCategoryId() != null) {
                category.setCategoryId(categoryDetails.getCategoryId());
            }
            if (categoryDetails.getDescription() != null) {
                category.setDescription(categoryDetails.getDescription());
            }
            if (categoryDetails.getSortOrder() != null) {
                category.setSortOrder(categoryDetails.getSortOrder());
            }
            return categoryRepository.save(category);
        });
    }

    public boolean deleteCategory(UUID id) {
        return categoryRepository.findById(id).map(category -> {
            categoryRepository.delete(category);
            return true;
        }).orElse(false);
    }

    private String generateCategoryId(String name) {
        String base = name.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (base.isEmpty()) {
            base = "cat";
        }
        return base + "-" + System.currentTimeMillis() % 10000;
    }
}
