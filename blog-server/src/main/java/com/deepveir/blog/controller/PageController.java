package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Page;
import com.deepveir.blog.repository.PageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
@CrossOrigin(origins = "*")
public class PageController {

    private final PageRepository pageRepository;

    public PageController(PageRepository pageRepository) {
        this.pageRepository = pageRepository;
    }

    /**
     * 获取所有页面（后台管理用）
     */
    @GetMapping
    public List<Page> getAllPages() {
        return pageRepository.findAll();
    }

    /**
     * 根据 pageId 获取页面（前端展示用）
     */
    @GetMapping("/{pageId}")
    public ResponseEntity<?> getPageByPageId(@PathVariable String pageId) {
        return pageRepository.findByPageId(pageId)
                .filter(page -> page.getStatus() == 1)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据 UUID 获取页面（后台编辑用）
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<?> getPageById(@PathVariable UUID id) {
        return pageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建页面
     */
    @PostMapping
    public ResponseEntity<?> createPage(@RequestBody Page page) {
        if (page.getPageId() == null || page.getPageId().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "pageId 不能为空"));
        }
        if (pageRepository.findByPageId(page.getPageId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "该页面标识已存在"));
        }
        Page saved = pageRepository.save(page);
        return ResponseEntity.ok(saved);
    }

    /**
     * 更新页面
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePage(@PathVariable UUID id, @RequestBody Page pageDetails) {
        return pageRepository.findById(id)
                .map(page -> {
                    if (pageDetails.getTitle() != null) page.setTitle(pageDetails.getTitle());
                    if (pageDetails.getTitleEn() != null) page.setTitleEn(pageDetails.getTitleEn());
                    if (pageDetails.getSubtitle() != null) page.setSubtitle(pageDetails.getSubtitle());
                    if (pageDetails.getSubtitleEn() != null) page.setSubtitleEn(pageDetails.getSubtitleEn());
                    if (pageDetails.getContent() != null) page.setContent(pageDetails.getContent());
                    if (pageDetails.getContentEn() != null) page.setContentEn(pageDetails.getContentEn());
                    if (pageDetails.getEmail() != null) page.setEmail(pageDetails.getEmail());
                    if (pageDetails.getGithub() != null) page.setGithub(pageDetails.getGithub());
                    if (pageDetails.getWebsite() != null) page.setWebsite(pageDetails.getWebsite());
                    if (pageDetails.getStatus() != null) page.setStatus(pageDetails.getStatus());
                    return ResponseEntity.ok(pageRepository.save(page));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 删除页面
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePage(@PathVariable UUID id) {
        return pageRepository.findById(id)
                .map(page -> {
                    pageRepository.delete(page);
                    return ResponseEntity.ok(Map.of("message", "删除成功"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
