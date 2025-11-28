package com.deepveir.blog.service;

import com.deepveir.blog.entity.Tag;
import com.deepveir.blog.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Optional<Tag> getTagById(UUID id) {
        return tagRepository.findById(id);
    }

    public Optional<Tag> getTagByTagId(String tagId) {
        return tagRepository.findByTagId(tagId);
    }

    public Tag createTag(Tag tag) {
        if (tag.getTagId() == null || tag.getTagId().isEmpty()) {
            tag.setTagId(generateTagId(tag.getName()));
        }
        return tagRepository.save(tag);
    }

    public Optional<Tag> updateTag(UUID id, Tag tagDetails) {
        return tagRepository.findById(id).map(tag -> {
            if (tagDetails.getName() != null) {
                tag.setName(tagDetails.getName());
            }
            if (tagDetails.getTagId() != null) {
                tag.setTagId(tagDetails.getTagId());
            }
            return tagRepository.save(tag);
        });
    }

    public boolean deleteTag(UUID id) {
        return tagRepository.findById(id).map(tag -> {
            tagRepository.delete(tag);
            return true;
        }).orElse(false);
    }

    private String generateTagId(String name) {
        String base = name.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (base.isEmpty()) {
            base = "tag";
        }
        return base + "-" + System.currentTimeMillis() % 10000;
    }
}
