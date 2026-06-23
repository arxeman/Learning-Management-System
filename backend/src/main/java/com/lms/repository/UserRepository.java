package com.lms.repository;

import com.lms.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByManagerId(String managerId);
    List<User> findByRole(String role);
    List<User> findByDepartment(String department);
    List<User> findByActiveTrue();
}
