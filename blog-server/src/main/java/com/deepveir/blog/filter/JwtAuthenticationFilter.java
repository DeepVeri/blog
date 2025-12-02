package com.deepveir.blog.filter;

import com.deepveir.blog.repository.UserRepository;
import com.deepveir.blog.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = extractToken(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            String email = jwtUtil.getEmail(token);
            String userId = jwtUtil.getUserId(token);
            String roleName = jwtUtil.getRoleName(token);
            Integer tokenVersion = jwtUtil.getTokenVersion(token);
            
            // 验证 Token 版本号（单点登录检查）
            boolean isValidVersion = userRepository.findByUserId(userId)
                    .map(user -> tokenVersion != null && tokenVersion.equals(user.getTokenVersion()))
                    .orElse(false);
            
            if (!isValidVersion) {
                // Token 版本号不匹配，说明用户在其他地方登录了，此 Token 已失效
                filterChain.doFilter(request, response);
                return;
            }
            
            // 创建认证对象
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + (roleName != null ? roleName.toUpperCase() : "USER")))
            );
            
            // 存储额外信息
            authentication.setDetails(new JwtUserDetails(userId, email, roleName));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求中提取 Token
     * 优先从 Authorization Header 获取，其次从 Cookie 获取
     */
    private String extractToken(HttpServletRequest request) {
        // 1. 从 Authorization Header 获取
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // 2. 从 Cookie 获取
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }

    /**
     * JWT 用户详情
     */
    public static class JwtUserDetails {
        private final String userId;
        private final String email;
        private final String roleName;

        public JwtUserDetails(String userId, String email, String roleName) {
            this.userId = userId;
            this.email = email;
            this.roleName = roleName;
        }

        public String getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getRoleName() { return roleName; }
    }
}
