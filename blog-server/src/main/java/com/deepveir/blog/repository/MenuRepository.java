package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuRepository extends JpaRepository<Menu, UUID> {
    Optional<Menu> findByMenuId(String menuId);
    boolean existsByMenuId(String menuId);
    List<Menu> findByParentIdIsNullOrderBySortOrder(); // Find root menus
    List<Menu> findAllByOrderBySortOrder(); // Find all ordered
    List<Menu> findByMenuIdIn(List<String> menuIds);
}
