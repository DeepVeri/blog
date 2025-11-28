package com.deepveir.blog.service;

import com.deepveir.blog.entity.Article;
import com.deepveir.blog.entity.Category;
import com.deepveir.blog.entity.Tag;
import com.deepveir.blog.entity.User;
import com.deepveir.blog.repository.ArticleRepository;
import com.deepveir.blog.repository.CategoryRepository;
import com.deepveir.blog.repository.TagRepository;
import com.deepveir.blog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ArticleService(ArticleRepository articleRepository,
                          TagRepository tagRepository,
                          UserRepository userRepository,
                          CategoryRepository categoryRepository) {
        this.articleRepository = articleRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Article> listArticles() {
        return articleRepository.findAll();
    }

    public Page<Article> listArticles(Pageable pageable) {
        return articleRepository.findAll(pageable);
    }

    public Optional<Article> getArticleById(UUID id) {
        return articleRepository.findById(id);
    }

    public Optional<Article> getArticleByArticleId(String articleId) {
        return articleRepository.findByArticleId(articleId);
    }

    @Transactional
    public Article saveArticle(Article article) {
        if (article.getArticleId() == null || article.getArticleId().isEmpty()) {
            article.setArticleId(UUID.randomUUID().toString().split("-")[0]);
        }
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return articleRepository.save(article);
    }

    @Transactional
    public void deleteArticle(UUID id) {
        articleRepository.deleteById(id);
    }

    public Set<Tag> resolveTags(List<String> tagIds) {
        if (tagIds == null) {
            return Set.of();
        }
        Set<Tag> references = new HashSet<>();
        for (String tagId : tagIds) {
            tagRepository.findByTagId(tagId).ifPresent(references::add);
        }
        return references;
    }

    public Optional<User> resolveAuthor(String authorId) {
        if (authorId == null || authorId.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByUserId(authorId);
    }

    public Optional<Category> resolveCategory(String categoryId) {
        if (categoryId == null || categoryId.isEmpty()) {
            return Optional.empty();
        }
        return categoryRepository.findByCategoryId(categoryId);
    }

    public Article updateArticle(Article existing, Article updates) {
        if (updates.getTitle() != null) {
            existing.setTitle(updates.getTitle());
        }
        if (updates.getSummary() != null) {
            existing.setSummary(updates.getSummary());
        }
        if (updates.getContent() != null) {
            existing.setContent(updates.getContent());
        }
        if (updates.getCoverImage() != null) {
            existing.setCoverImage(updates.getCoverImage());
        }
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        if (updates.getReadTime() != null) {
            existing.setReadTime(updates.getReadTime());
        }
        if (updates.getPublishedAt() != null) {
            existing.setPublishedAt(updates.getPublishedAt());
        }
        if (updates.getAuthor() != null) {
            existing.setAuthor(updates.getAuthor());
        }
        if (updates.getCategory() != null) {
            existing.setCategory(updates.getCategory());
        }
        if (!updates.getTags().isEmpty()) {
            existing.setTags(updates.getTags());
        }
        return articleRepository.save(existing);
    }

    /**
     * 获取相关文章推荐
     * 策略：优先按分类推荐，不足时补充标签相关文章
     */
    public List<Article> getRelatedArticles(String articleId, int limit) {
        Optional<Article> optionalArticle = articleRepository.findByArticleId(articleId);
        if (optionalArticle.isEmpty()) {
            return new ArrayList<>();
        }
        
        Article currentArticle = optionalArticle.get();
        Set<Article> relatedSet = new LinkedHashSet<>();
        
        // 1. 先按分类查找
        if (currentArticle.getCategory() != null) {
            List<Article> byCategory = articleRepository.findRelatedByCategory(
                    currentArticle.getCategory().getCategoryId(),
                    articleId,
                    PageRequest.of(0, limit)
            );
            relatedSet.addAll(byCategory);
        }
        
        // 2. 如果数量不足，再按标签补充
        if (relatedSet.size() < limit && !currentArticle.getTags().isEmpty()) {
            List<String> tagIds = currentArticle.getTags().stream()
                    .map(Tag::getTagId)
                    .collect(Collectors.toList());
            List<Article> byTags = articleRepository.findRelatedByTags(
                    tagIds,
                    articleId,
                    PageRequest.of(0, limit - relatedSet.size())
            );
            relatedSet.addAll(byTags);
        }
        
        return new ArrayList<>(relatedSet).stream().limit(limit).collect(Collectors.toList());
    }
}
