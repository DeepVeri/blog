package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {
    Optional<Tag> findByTagId(String tagId);
    boolean existsByTagId(String tagId);
}
