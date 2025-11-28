package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Tag;
import com.deepveir.blog.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tag> getTagById(@PathVariable UUID id) {
        return tagService.getTagById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-tag-id/{tagId}")
    public ResponseEntity<Tag> getTagByTagId(@PathVariable String tagId) {
        return tagService.getTagByTagId(tagId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTag(@RequestBody Tag tag) {
        if (tag.getName() == null || tag.getName().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "标签名称不能为空"));
        }
        Tag saved = tagService.createTag(tag);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTag(@PathVariable UUID id, @RequestBody Tag tagDetails) {
        return tagService.updateTag(id, tagDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable UUID id) {
        if (tagService.deleteTag(id)) {
            return ResponseEntity.ok(Map.of("message", "标签删除成功"));
        }
        return ResponseEntity.notFound().build();
    }
}
