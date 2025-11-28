package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findByCategoryId(String categoryId);
    boolean existsByCategoryId(String categoryId);
    List<Category> findAllByOrderBySortOrderAsc();
}
