package com.deepveir.blog.controller;

import com.deepveir.blog.dto.ArticleRequestDto;
import com.deepveir.blog.entity.Article;
import com.deepveir.blog.service.ArticleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public Page<Article> listArticles(
            @PageableDefault(sort = "createTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return articleService.listArticles(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticle(@PathVariable UUID id) {
        return articleService.getArticleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-article-id/{articleId}")
    public ResponseEntity<Article> getArticleByArticleId(@PathVariable String articleId) {
        return articleService.getArticleByArticleId(articleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-article-id/{articleId}/related")
    public List<Article> getRelatedArticles(
            @PathVariable String articleId,
            @RequestParam(defaultValue = "4") int limit) {
        return articleService.getRelatedArticles(articleId, limit);
    }

    @PostMapping
    public ResponseEntity<?> createArticle(@RequestBody ArticleRequestDto dto) {
        Article article = mapDto(dto);
        Article saved = articleService.saveArticle(article);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable UUID id, @RequestBody ArticleRequestDto dto) {
        Optional<Article> existing = articleService.getArticleById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Article updates = mapDto(dto);
        Article updated = articleService.updateArticle(existing.get(), updates);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable UUID id) {
        if (articleService.getArticleById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        articleService.deleteArticle(id);
        return ResponseEntity.ok(Map.of("message", "Article deleted"));
    }

    private Article mapDto(ArticleRequestDto dto) {
        Article article = new Article();
        article.setArticleId(dto.getArticleId());
        article.setTitle(dto.getTitle());
        article.setSummary(dto.getSummary());
        article.setContent(dto.getContent());
        article.setCoverImage(dto.getCoverImage());
        article.setStatus(dto.getStatus());
        article.setReadTime(dto.getReadTime());
        article.setPublishedAt(dto.getPublishedAt());
        article.setTags(articleService.resolveTags(dto.getTagIds()));
        articleService.resolveAuthor(dto.getAuthorId()).ifPresent(article::setAuthor);
        articleService.resolveCategory(dto.getCategoryId()).ifPresent(article::setCategory);
        return article;
    }
}
