package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PageRepository extends JpaRepository<Page, UUID> {
    Optional<Page> findByPageId(String pageId);
    List<Page> findByStatus(Integer status);
}
