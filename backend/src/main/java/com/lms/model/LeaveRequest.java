package com.lms.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "leave_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {

    @Id
    private String id;

    private String employeeId;
    private String employeeName;
    private String employeeEmail;

    private String leaveType;   // CASUAL, SICK, EARNED, UNPAID

    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;

    private String reason;

    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    private String managerId;
    private String managerName;

    private String rejectionReason;
    private String approverComment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    private LocalDateTime actionDate;
}
