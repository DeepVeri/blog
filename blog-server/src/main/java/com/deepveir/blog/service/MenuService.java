package com.deepveir.blog.service;

import com.deepveir.blog.entity.Menu;
import com.deepveir.blog.entity.User;
import com.deepveir.blog.repository.MenuRepository;
import com.deepveir.blog.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final UserRepository userRepository;

    public MenuService(MenuRepository menuRepository, UserRepository userRepository) {
        this.menuRepository = menuRepository;
        this.userRepository = userRepository;
    }

    public Optional<User> findUserByUserIdOrUuid(String userId) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(userId);
                userOpt = userRepository.findById(uuid);
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
        return userOpt;
    }

    public List<Menu> getMenusForUser(User user) {
        if (user.getRole() == null) {
            return List.of();
        }
        Set<Menu> roleMenus = user.getRole().getMenus();
        List<Menu> visibleMenus = roleMenus.stream()
                .filter(m -> Boolean.TRUE.equals(m.getVisible()))
                .filter(m -> m.getStatus() == null || m.getStatus() == 1)
                .sorted(Comparator.comparingInt(Menu::getSortOrder))
                .collect(Collectors.toList());
        return buildMenuTree(visibleMenus);
    }

    public List<Menu> getAllMenusTree() {
        List<Menu> allMenus = menuRepository.findAllByOrderBySortOrder();
        return buildMenuTree(allMenus);
    }

    public List<Menu> getAllMenusFlat() {
        return menuRepository.findAllByOrderBySortOrder();
    }

    public Menu createMenu(Menu menu) {
        if (menu.getMenuId() == null || menu.getMenuId().isEmpty()) {
            String generatedId = generateMenuId(menu.getName());
            menu.setMenuId(generatedId);
        }
        if (menu.getSortOrder() == null) {
            menu.setSortOrder(0);
        }
        if (menu.getVisible() == null) {
            menu.setVisible(true);
        }
        if (menu.getStatus() == null) {
            menu.setStatus(1);
        }
        return menuRepository.save(menu);
    }

    public Optional<Menu> updateMenu(UUID id, Menu menuDetails) {
        return menuRepository.findById(id).map(menu -> {
            menu.setName(menuDetails.getName());
            menu.setPath(menuDetails.getPath());
            menu.setIcon(menuDetails.getIcon());
            menu.setSortOrder(menuDetails.getSortOrder());
            menu.setType(menuDetails.getType());
            menu.setPermission(menuDetails.getPermission());
            menu.setVisible(menuDetails.getVisible());
            menu.setStatus(menuDetails.getStatus());
            menu.setParentId(menuDetails.getParentId());
            return menuRepository.save(menu);
        });
    }

    public boolean deleteMenuWithChildren(UUID id) {
        return menuRepository.findById(id).map(menu -> {
            deleteMenuAndChildren(menu.getMenuId());
            return true;
        }).orElse(false);
    }

    public void updateSort(List<Map<String, Object>> sortData) {
        for (Map<String, Object> item : sortData) {
            String id = (String) item.get("id");
            Integer sortOrder = (Integer) item.get("sortOrder");
            String parentId = (String) item.get("parentId");

            try {
                UUID uuid = UUID.fromString(id);
                menuRepository.findById(uuid).ifPresent(menu -> {
                    menu.setSortOrder(sortOrder);
                    menu.setParentId(parentId);
                    menuRepository.save(menu);
                });
            } catch (Exception e) {
                // Skip invalid entries
            }
        }
    }

    private void deleteMenuAndChildren(String menuId) {
        List<Menu> allMenus = menuRepository.findAllByOrderBySortOrder();
        List<Menu> children = allMenus.stream()
                .filter(m -> menuId.equals(m.getParentId()))
                .collect(Collectors.toList());

        for (Menu child : children) {
            deleteMenuAndChildren(child.getMenuId());
        }

        menuRepository.findByMenuId(menuId).ifPresent(menuRepository::delete);
    }

    private String generateMenuId(String name) {
        String hash = Integer.toHexString(name.hashCode());
        hash = hash.substring(0, Math.min(4, hash.length()));
        String timestamp = String.valueOf(System.currentTimeMillis() % 10000);
        return "m-" + hash + timestamp;
    }

    private List<Menu> buildMenuTree(List<Menu> allMenus) {
        List<Menu> rootMenus = new ArrayList<>();
        Map<String, Menu> menuMap = allMenus.stream()
                .filter(m -> m.getMenuId() != null)
                .collect(Collectors.toMap(Menu::getMenuId, menu -> menu, (a, b) -> a));

        for (Menu menu : allMenus) {
            menu.setChildren(new ArrayList<>());
        }

        for (Menu menu : allMenus) {
            if (menu.getParentId() == null || menu.getParentId().isEmpty() || !menuMap.containsKey(menu.getParentId())) {
                rootMenus.add(menu);
            } else {
                Menu parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    parent.getChildren().add(menu);
                }
            }
        }
        return rootMenus;
    }
}
