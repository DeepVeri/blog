package com.deepveir.blog.repository;

import com.deepveir.blog.entity.SiteStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SiteStatsRepository extends JpaRepository<SiteStats, Long> {

    Optional<SiteStats> findByDate(LocalDate date);

    // 获取最近 N 天的统计
    List<SiteStats> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    // 获取总 PV
    @Query("SELECT COALESCE(SUM(s.pageViews), 0) FROM SiteStats s")
    Long getTotalPageViews();

    // 获取总 UV
    @Query("SELECT COALESCE(SUM(s.uniqueVisitors), 0) FROM SiteStats s")
    Long getTotalUniqueVisitors();
}
