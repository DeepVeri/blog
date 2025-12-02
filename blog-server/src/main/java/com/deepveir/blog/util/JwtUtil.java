package com.deepveir.blog.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret:deepveir-blog-secret-key-must-be-at-least-256-bits-long}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 默认 24 小时
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 JWT Token（带版本号，用于单点登录）
     */
    public String generateToken(String userId, String email, String roleName, Integer tokenVersion) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("roleName", roleName);
        claims.put("tokenVersion", tokenVersion != null ? tokenVersion : 1);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从 Token 中获取 Claims
     */
    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 获取用户邮箱
     */
    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * 获取用户 ID
     */
    public String getUserId(String token) {
        return getClaims(token).get("userId", String.class);
    }

    /**
     * 获取角色名称
     */
    public String getRoleName(String token) {
        return getClaims(token).get("roleName", String.class);
    }

    /**
     * 获取 Token 版本号
     */
    public Integer getTokenVersion(String token) {
        return getClaims(token).get("tokenVersion", Integer.class);
    }

    /**
     * 验证 Token 是否有效
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 检查 Token 是否过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
