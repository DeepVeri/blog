package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Role;
import com.deepveir.blog.entity.User;
import com.deepveir.blog.repository.RoleRepository;
import com.deepveir.blog.repository.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
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

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
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
            
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "注册成功"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Simplified login for demo
        // In production, use AuthenticationManager and return JWT
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> ResponseEntity.ok(Map.of(
                    "token", "fake-jwt-token-for-demo",
                    "email", user.getEmail(),
                    "userId", user.getUserId()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "账号或密码错误")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In a real JWT app, you might blacklist the token here
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
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
