package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Category;
import com.deepveir.blog.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable UUID id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-category-id/{categoryId}")
    public ResponseEntity<Category> getCategoryByCategoryId(@PathVariable String categoryId) {
        return categoryService.getCategoryByCategoryId(categoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getName().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "分类名称不能为空"));
        }
        Category saved = categoryService.createCategory(category);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable UUID id, @RequestBody Category categoryDetails) {
        return categoryService.updateCategory(id, categoryDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        if (categoryService.deleteCategory(id)) {
            return ResponseEntity.ok(Map.of("message", "分类删除成功"));
        }
        return ResponseEntity.notFound().build();
    }
}
