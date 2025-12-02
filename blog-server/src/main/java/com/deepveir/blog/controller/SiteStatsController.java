package com.deepveir.blog.controller;

import com.deepveir.blog.entity.SiteStats;
import com.deepveir.blog.service.SiteStatsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class SiteStatsController {

    @Autowired
    private SiteStatsService siteStatsService;

    /**
     * 记录页面访问（前端调用）
     * POST /api/stats/visit
     */
    @PostMapping("/visit")
    public ResponseEntity<Map<String, String>> recordVisit(HttpServletRequest request) {
        String visitorIp = getClientIp(request);
        siteStatsService.recordVisit(visitorIp);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /**
     * 获取统计概览（后台管理用）
     * GET /api/stats/overview
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(siteStatsService.getStatsOverview());
    }

    /**
     * 获取最近 N 天统计（默认 7 天）
     * GET /api/stats/recent?days=7
     */
    @GetMapping("/recent")
    public ResponseEntity<List<SiteStats>> getRecentStats(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(siteStatsService.getRecentStats(days));
    }

    /**
     * 获取客户端真实 IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 如果有多个 IP（代理链），取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
