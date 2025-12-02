package com.deepveir.blog.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "pages")
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", unique = true, nullable = false)
    private String pageId;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_en")
    private String titleEn;

    private String subtitle;

    @Column(name = "subtitle_en")
    private String subtitleEn;

    @Column(columnDefinition = "longtext")
    private String content;

    @Column(name = "content_en", columnDefinition = "longtext")
    private String contentEn;

    private String email;

    private String github;

    private String website;

    private Integer status = 1;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
