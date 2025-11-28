package com.deepveir.blog.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "menus")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "menu_id", unique = true, nullable = false)
    private String menuId;

    private String parentId; // Null for root menu

    @Column(nullable = false)
    private String name; // Menu name e.g. "User Management"

    private String path; // Router path e.g. "/users"

    private String icon; // Icon name e.g. "Users"

    private Integer sortOrder = 0; // Display order

    @Column(length = 50)
    private String type; // "MENU", "BUTTON", "DIRECTORY"

    private String permission; // Permission identifier e.g. "user:list"

    private Boolean visible = true; // Show in sidebar

    private Integer status = 1; // 1: Active, 0: Disabled

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;

    // Transient field for tree structure in API response
    @Transient
    private List<Menu> children = new ArrayList<>();
}
