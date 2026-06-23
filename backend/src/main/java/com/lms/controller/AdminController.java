package com.lms.controller;

import com.lms.dto.*;
import com.lms.model.User;
import com.lms.service.AuthService;
import com.lms.service.LeaveService;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserService userService;
    @Autowired private AuthService authService;
    @Autowired private LeaveService leaveService;

    // ── User CRUD ─────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        user.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<String>> createUser(
            @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(
                ApiResponse.success("User created successfully", user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable String id,
            @RequestBody UserUpdateDto dto) {
        try {
            User updated = userService.updateUser(id, dto);
            updated.setPassword(null);
            return ResponseEntity.ok(ApiResponse.success("User updated", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted", id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(userService.getStats()));
    }

    // ── Seed default data ─────────────────────────────────────────────────────
    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<String>> seedData() {
        try {
            // Admin
            seedUser("Admin User",  "admin@lms.com",    "admin123",   "ROLE_ADMIN",    "IT",   null);
            // Manager
            String mgr1 = seedUser("Alice Manager", "alice@lms.com", "manager123", "ROLE_MANAGER", "Engineering", null);
            String mgr2 = seedUser("Bob Manager",   "bob@lms.com",   "manager123", "ROLE_MANAGER", "HR",          null);
            // Employees under Alice
            seedUser("Charlie Emp",  "charlie@lms.com", "emp123", "ROLE_EMPLOYEE", "Engineering", mgr1);
            seedUser("Diana Emp",    "diana@lms.com",   "emp123", "ROLE_EMPLOYEE", "Engineering", mgr1);
            // Employees under Bob
            seedUser("Eve Emp",      "eve@lms.com",     "emp123", "ROLE_EMPLOYEE", "HR", mgr2);

            return ResponseEntity.ok(ApiResponse.success(
                "Seed completed. Logins: admin@lms.com/admin123, alice@lms.com/manager123, charlie@lms.com/emp123"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Seed failed: " + e.getMessage()));
        }
    }

    @Autowired
    private com.lms.repository.UserRepository userRepository;

    /** Creates user if not exists; returns the user's ID */
    private String seedUser(String name, String email, String password,
                             String role, String dept, String managerId) {
        return userRepository.findByEmail(email)
            .map(User::getId)
            .orElseGet(() -> {
                RegisterRequest req = new RegisterRequest();
                req.setName(name); req.setEmail(email); req.setPassword(password);
                req.setRole(role); req.setDepartment(dept); req.setManagerId(managerId);
                return authService.register(req).getId();
            });
    }
}
