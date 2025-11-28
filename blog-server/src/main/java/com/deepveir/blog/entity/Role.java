package com.deepveir.blog.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "role_id", unique = true, nullable = false)
    private String roleId;

    @Column(unique = true, nullable = false)
    private String name; // e.g. "ADMIN", "EDITOR"

    private String description; // e.g. "Administrator with full access"
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_menus",
        joinColumns = @JoinColumn(name = "role_id", referencedColumnName = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "menu_id", referencedColumnName = "menu_id")
    )
    private Set<Menu> menus = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;
}
