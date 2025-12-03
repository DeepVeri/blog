package com.deepveir.blog.controller;

import com.deepveir.blog.entity.User;
import com.deepveir.blog.filter.JwtAuthenticationFilter;
import com.deepveir.blog.repository.RoleRepository;
import com.deepveir.blog.repository.UserRepository;
import com.deepveir.blog.util.JwtUtil;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, 
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "该邮箱已被注册"));
            }

            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            // userId 由 @PrePersist 自动生成 UUID
            
            // 分配默认角色 "user"
            roleRepository.findByRoleId("user").ifPresent(role -> {
                user.setRole(role);
                user.setRoleName(role.getName());
            });
            
            User savedUser = userRepository.save(user);
            
            // 新用户默认禁用，不返回 token，需管理员审核后才能登录
            return ResponseEntity.ok(Map.of(
                "message", "注册成功，请等待管理员审核后方可登录",
                "email", savedUser.getEmail(),
                "userId", savedUser.getUserId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> {
                    // 检查用户是否被禁用
                    if (!user.isEnabled()) {
                        return ResponseEntity.status(403).body(Map.of("error", "账号已被禁用，请联系管理员"));
                    }
                    // 更新 Token 版本号（实现单点登录，旧 Token 失效）
                    int newVersion = (user.getTokenVersion() != null ? user.getTokenVersion() : 0) + 1;
                    user.setTokenVersion(newVersion);
                    userRepository.save(user);
                    
                    // 生成 JWT Token（带版本号）
                    String token = jwtUtil.generateToken(
                        user.getUserId(), 
                        user.getEmail(), 
                        user.getRoleName(),
                        newVersion
                    );
                    return ResponseEntity.ok(Map.of(
                        "token", token,
                        "email", user.getEmail(),
                        "userId", user.getUserId(),
                        "roleName", user.getRoleName() != null ? user.getRoleName() : "",
                        "username", user.getUsername() != null ? user.getUsername() : ""
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "账号或密码错误")));
    }

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }
        
        JwtAuthenticationFilter.JwtUserDetails details = 
            (JwtAuthenticationFilter.JwtUserDetails) auth.getDetails();
        
        if (details == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Token 无效"));
        }
        
        // 从数据库获取最新用户信息
        return userRepository.findByUserId(details.getUserId())
                .map(user -> ResponseEntity.ok(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "username", user.getUsername() != null ? user.getUsername() : "",
                    "roleName", user.getRoleName() != null ? user.getRoleName() : "",
                    "avatar", user.getAvatar() != null ? user.getAvatar() : ""
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "用户不存在")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // 更新 token_version 使当前 Token 失效
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.JwtUserDetails) {
            JwtAuthenticationFilter.JwtUserDetails details = 
                (JwtAuthenticationFilter.JwtUserDetails) auth.getDetails();
            userRepository.findByUserId(details.getUserId()).ifPresent(user -> {
                user.setTokenVersion((user.getTokenVersion() != null ? user.getTokenVersion() : 0) + 1);
                userRepository.save(user);
            });
        }
        return ResponseEntity.ok(Map.of("message", "退出成功"));
    }

    @Data
    static class RegisterRequest {
        private String email;
        private String password;
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }
}
