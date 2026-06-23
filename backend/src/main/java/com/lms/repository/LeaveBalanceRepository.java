package com.lms.repository;

import com.lms.model.LeaveBalance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LeaveBalanceRepository extends MongoRepository<LeaveBalance, String> {
    Optional<LeaveBalance> findByEmployeeIdAndYear(String employeeId, int year);
    Optional<LeaveBalance> findByEmployeeId(String employeeId);
}
