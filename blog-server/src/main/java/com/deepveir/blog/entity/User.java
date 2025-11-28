package com.deepveir.blog.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "users")
// Avoid leaking sensitive data when referenced by other entities
@JsonIgnoreProperties(value = {"password", "organizationEntity"}, allowGetters = false)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", referencedColumnName = "role_id")
    private Role role;

    // 所属组织（实体关联，多层级树的一部分）
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "org_id", referencedColumnName = "org_id")
    private Organization organizationEntity;
    
    // New optimized fields
    private String avatar; // Avatar URL
    
    @Column(length = 500)
    private String bio;    // Short biography
    
    private String website; // Personal website
    
    // Professional Info
    private String organization; // 组织/部门名称（冗余，方便显示）
    private String jobTitle;     // 职位/头衔
    
    // Contact Info
    private String phone;        // 手机号
    
    // Status & Audit
    private Integer status = 1;  // 1: 正常, 0: 禁用
    private LocalDateTime lastLoginTime;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;
    
    @UpdateTimestamp
    private LocalDateTime updateTime;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + role.getName()));
        }
        return List.of();
    }
    
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status != null && status == 1;
    }
}
