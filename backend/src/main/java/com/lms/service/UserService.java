package com.lms.service;

import com.lms.dto.UserUpdateDto;
import com.lms.model.User;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllManagers() {
        return userRepository.findByRole("ROLE_MANAGER");
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(String id, UserUpdateDto dto) {
        User user = getUserById(id);

        if (dto.getName() != null)       user.setName(dto.getName());
        if (dto.getDepartment() != null) user.setDepartment(dto.getDepartment());
        if (dto.getManagerId() != null)  {
            user.setManagerId(dto.getManagerId());
            userRepository.findById(dto.getManagerId())
                .ifPresent(m -> user.setManagerName(m.getName()));
        }
        if (dto.getRole() != null)   user.setRole(dto.getRole());
        if (dto.getActive() != null) user.setActive(dto.getActive());

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public Map<String, Long> getStats() {
        long totalUsers = userRepository.count();
        long admins    = userRepository.findByRole("ROLE_ADMIN").size();
        long managers  = userRepository.findByRole("ROLE_MANAGER").size();
        long employees = userRepository.findByRole("ROLE_EMPLOYEE").size();
        return Map.of(
            "total", totalUsers,
            "admins", admins,
            "managers", managers,
            "employees", employees
        );
    }
}
