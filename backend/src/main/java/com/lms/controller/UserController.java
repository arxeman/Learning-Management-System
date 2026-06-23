package com.lms.controller;

import com.lms.dto.ApiResponse;
import com.lms.model.User;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        user.setPassword(null); // Never expose password
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/managers")
    public ResponseEntity<ApiResponse<List<User>>> getManagers() {
        List<User> managers = userService.getAllManagers();
        managers.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success(managers));
    }
}
