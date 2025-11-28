package com.deepveir.blog.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "article_id", unique = true, nullable = false)
    private String articleId;

    @Column(nullable = false)
    private String title;

    private String summary;

    @Column(columnDefinition = "longtext")
    private String content;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(length = 20)
    private String status = "draft";

    @Column(name = "read_time")
    private String readTime;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", referencedColumnName = "user_id")
    @JsonIgnoreProperties(value = {"password", "organizationEntity"})
    private User author;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", referencedColumnName = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "article_tags",
            joinColumns = @JoinColumn(name = "article_id", referencedColumnName = "article_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id", referencedColumnName = "tag_id")
    )
    @JsonIgnoreProperties("articles")
    private Set<Tag> tags = new HashSet<>();

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
