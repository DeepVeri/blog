package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
    
    // 带 EntityGraph 的查询，主动加载 category 和 tags
    @EntityGraph(attributePaths = {"category", "tags"})
    Optional<Article> findByArticleId(String articleId);
    
    @EntityGraph(attributePaths = {"category", "tags"})
    Optional<Article> findWithDetailsById(UUID id);
    
    @EntityGraph(attributePaths = {"category", "tags"})
    @Query("SELECT a FROM Article a")
    Page<Article> findAllWithDetails(Pageable pageable);
    
    boolean existsByArticleId(String articleId);

    // 根据分类查找相关文章（排除当前文章）
    @Query("SELECT a FROM Article a WHERE a.category.categoryId = :categoryId AND a.articleId <> :excludeArticleId AND a.status = 'published' ORDER BY a.publishedAt DESC")
    List<Article> findRelatedByCategory(@Param("categoryId") String categoryId, 
                                        @Param("excludeArticleId") String excludeArticleId, 
                                        Pageable pageable);

    // 根据标签查找相关文章（排除当前文章）
    @Query("SELECT DISTINCT a FROM Article a JOIN a.tags t WHERE t.tagId IN :tagIds AND a.articleId <> :excludeArticleId AND a.status = 'published' ORDER BY a.publishedAt DESC")
    List<Article> findRelatedByTags(@Param("tagIds") List<String> tagIds, 
                                    @Param("excludeArticleId") String excludeArticleId, 
                                    Pageable pageable);
}
