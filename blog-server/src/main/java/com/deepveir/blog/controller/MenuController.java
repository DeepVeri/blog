package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Menu;
import com.deepveir.blog.entity.User;
import com.deepveir.blog.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // 查: 获取当前用户的菜单树
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserMenus(@PathVariable String userId) {
        System.out.println("Fetching menus for userId: " + userId);

        Optional<User> userOpt = menuService.findUserByUserIdOrUuid(userId);

        if (userOpt.isEmpty()) {
            System.out.println("User not found: " + userId);
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (user.getRole() == null) {
            System.out.println("User has no role");
            return ResponseEntity.ok(List.of());
        }

        List<Menu> tree = menuService.getMenusForUser(user);
        System.out.println("Tree roots count: " + tree.size());
        return ResponseEntity.ok(tree);
    }

    // 查: 获取所有菜单（树形结构）
    @GetMapping
    public List<Menu> getAllMenus() {
        return menuService.getAllMenusTree();
    }

    // 查: 获取所有菜单（平铺列表，用于父级选择）
    @GetMapping("/list")
    public List<Menu> getAllMenusFlat() {
        return menuService.getAllMenusFlat();
    }

    // 增: 创建菜单
    @PostMapping
    public ResponseEntity<?> createMenu(@RequestBody Menu menu) {
        // 检查 menuId 是否已存在
        if (menu.getMenuId() != null && !menu.getMenuId().isEmpty() && menuService.getAllMenusFlat().stream().anyMatch(m -> m.getMenuId().equals(menu.getMenuId()))) {
            return ResponseEntity.badRequest().body(Map.of("error", "菜单ID已存在: " + menu.getMenuId()));
        }

        Menu saved = menuService.createMenu(menu);
        return ResponseEntity.ok(saved);
    }

    // 改: 更新菜单
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable UUID id, @RequestBody Menu menuDetails) {
        return menuService.updateMenu(id, menuDetails)
                .map(updated -> ResponseEntity.ok(updated))
                .orElse(ResponseEntity.notFound().build());
    }

    // 删: 删除菜单（级联删除子菜单）
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenu(@PathVariable UUID id) {
        boolean deleted = menuService.deleteMenuWithChildren(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "菜单删除成功"));
        }
        return ResponseEntity.notFound().build();
    }

    // 批量更新排序
    @PutMapping("/sort")
    public ResponseEntity<?> updateSort(@RequestBody List<Map<String, Object>> sortData) {
        menuService.updateSort(sortData);
        return ResponseEntity.ok(Map.of("message", "排序更新成功"));
    }
}
