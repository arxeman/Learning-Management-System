package com.lms.repository;

import com.lms.model.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<LeaveRequest> findByManagerIdOrderByCreatedAtDesc(String managerId);
    List<LeaveRequest> findByManagerIdAndStatusOrderByCreatedAtDesc(String managerId, String status);
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByManagerIdAndStatus(String managerId, String status);
}
