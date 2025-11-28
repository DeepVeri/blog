package com.deepveir.blog.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleRequestDto {
    private String articleId;
    private String title;
    private String summary;
    private String content;
    private String coverImage;
    private String status;
    private String readTime;
    private LocalDateTime publishedAt;
    private String authorId;
    private String categoryId;
    private List<String> tagIds;
}
