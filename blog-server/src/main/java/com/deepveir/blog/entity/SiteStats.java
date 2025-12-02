package com.deepveir.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "site_stats")
public class SiteStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false)
    private Long pageViews = 0L;  // 页面浏览量 (PV)

    @Column(nullable = false)
    private Long uniqueVisitors = 0L;  // 独立访客数 (UV)

    public SiteStats() {}

    public SiteStats(LocalDate date) {
        this.date = date;
        this.pageViews = 0L;
        this.uniqueVisitors = 0L;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getPageViews() { return pageViews; }
    public void setPageViews(Long pageViews) { this.pageViews = pageViews; }

    public Long getUniqueVisitors() { return uniqueVisitors; }
    public void setUniqueVisitors(Long uniqueVisitors) { this.uniqueVisitors = uniqueVisitors; }
}
