package com.deepveir.blog.service;

import com.deepveir.blog.entity.SiteStats;
import com.deepveir.blog.repository.SiteStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SiteStatsService {

    @Autowired
    private SiteStatsRepository siteStatsRepository;

    // 用于存储当天已访问的 IP（简单的 UV 去重）
    // 生产环境建议用 Redis
    private final Set<String> todayVisitors = ConcurrentHashMap.newKeySet();
    private LocalDate lastResetDate = LocalDate.now();

    /**
     * 记录一次页面访问
     * @param visitorIp 访客 IP 地址
     */
    @Transactional
    public void recordVisit(String visitorIp) {
        LocalDate today = LocalDate.now();

        // 如果跨天了，清空当天访客记录
        if (!today.equals(lastResetDate)) {
            todayVisitors.clear();
            lastResetDate = today;
        }

        // 获取或创建今天的统计记录
        SiteStats stats = siteStatsRepository.findByDate(today)
                .orElseGet(() -> {
                    SiteStats newStats = new SiteStats(today);
                    return siteStatsRepository.save(newStats);
                });

        // PV +1
        stats.setPageViews(stats.getPageViews() + 1);

        // 如果是新访客，UV +1
        if (visitorIp != null && !todayVisitors.contains(visitorIp)) {
            todayVisitors.add(visitorIp);
            stats.setUniqueVisitors(stats.getUniqueVisitors() + 1);
        }

        siteStatsRepository.save(stats);
    }

    /**
     * 获取统计概览
     */
    public Map<String, Object> getStatsOverview() {
        Map<String, Object> result = new HashMap<>();
        
        LocalDate today = LocalDate.now();
        SiteStats todayStats = siteStatsRepository.findByDate(today).orElse(new SiteStats(today));

        result.put("todayPV", todayStats.getPageViews());
        result.put("todayUV", todayStats.getUniqueVisitors());
        result.put("totalPV", siteStatsRepository.getTotalPageViews());
        result.put("totalUV", siteStatsRepository.getTotalUniqueVisitors());

        return result;
    }

    /**
     * 获取最近 N 天的统计数据
     */
    public List<SiteStats> getRecentStats(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        return siteStatsRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }
}
