package com.lms.service;

import com.lms.dto.LeaveRequestDto;
import com.lms.dto.UpdateLeaveStatusDto;
import com.lms.model.LeaveBalance;
import com.lms.model.LeaveRequest;
import com.lms.model.User;
import com.lms.repository.LeaveBalanceRepository;
import com.lms.repository.LeaveRequestRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
public class LeaveService {

    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private LeaveBalanceRepository leaveBalanceRepository;
    @Autowired private UserRepository userRepository;

    // ── Employee applies for leave ──────────────────────────────────────────
    public LeaveRequest applyLeave(String employeeEmail, LeaveRequestDto dto) {
        User employee = userRepository.findByEmail(employeeEmail)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Validate dates
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }
        if (dto.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot apply leave for past dates");
        }

        int days = countWorkingDays(dto.getStartDate(), dto.getEndDate());
        if (days == 0) throw new RuntimeException("Leave must include at least one working day");

        // Check balance (except UNPAID)
        if (!dto.getLeaveType().equals("UNPAID")) {
            checkAndValidateBalance(employee.getId(), dto.getLeaveType(), days);
        }

        LeaveRequest leave = LeaveRequest.builder()
            .employeeId(employee.getId())
            .employeeName(employee.getName())
            .employeeEmail(employee.getEmail())
            .leaveType(dto.getLeaveType())
            .startDate(dto.getStartDate())
            .endDate(dto.getEndDate())
            .numberOfDays(days)
            .reason(dto.getReason())
            .status("PENDING")
            .managerId(employee.getManagerId())
            .managerName(employee.getManagerName())
            .createdAt(LocalDateTime.now())
            .build();

        return leaveRequestRepository.save(leave);
    }

    // ── Employee views own leaves ───────────────────────────────────────────
    public List<LeaveRequest> getMyLeaves(String employeeEmail) {
        User employee = userRepository.findByEmail(employeeEmail)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());
    }

    // ── Employee cancels a pending leave ───────────────────────────────────
    public LeaveRequest cancelLeave(String leaveId, String employeeEmail) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        User employee = userRepository.findByEmail(employeeEmail)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!leave.getEmployeeId().equals(employee.getId())) {
            throw new AccessDeniedException("You can only cancel your own leaves");
        }
        if (leave.getStatus().equals("APPROVED")) {
            // If cancelling an approved leave, restore the balance
            restoreBalance(employee.getId(), leave.getLeaveType(), leave.getNumberOfDays());
        }
        if (!leave.getStatus().equals("PENDING") && !leave.getStatus().equals("APPROVED")) {
            throw new RuntimeException("Only PENDING or APPROVED leaves can be cancelled");
        }

        leave.setStatus("CANCELLED");
        leave.setUpdatedAt(LocalDateTime.now());
        return leaveRequestRepository.save(leave);
    }

    // ── Manager views team leaves ───────────────────────────────────────────
    public List<LeaveRequest> getTeamLeaves(String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
            .orElseThrow(() -> new RuntimeException("Manager not found"));
        return leaveRequestRepository.findByManagerIdOrderByCreatedAtDesc(manager.getId());
    }

    public List<LeaveRequest> getPendingTeamLeaves(String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
            .orElseThrow(() -> new RuntimeException("Manager not found"));
        return leaveRequestRepository
            .findByManagerIdAndStatusOrderByCreatedAtDesc(manager.getId(), "PENDING");
    }

    // ── Manager/Admin approves or rejects a leave ──────────────────────────
    public LeaveRequest updateLeaveStatus(String leaveId,
                                          UpdateLeaveStatusDto dto,
                                          String approverEmail) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        User approver = userRepository.findByEmail(approverEmail)
            .orElseThrow(() -> new RuntimeException("Approver not found"));

        // Non-admin managers can only act on their own team's leaves
        if (!approver.getRole().equals("ROLE_ADMIN")
                && !approver.getId().equals(leave.getManagerId())) {
            throw new AccessDeniedException("You are not authorized to act on this leave");
        }

        if (!leave.getStatus().equals("PENDING")) {
            throw new RuntimeException("Only PENDING leaves can be approved or rejected");
        }

        String newStatus = dto.getStatus().toUpperCase();
        leave.setStatus(newStatus);
        leave.setActionDate(LocalDateTime.now());
        leave.setUpdatedAt(LocalDateTime.now());

        if (newStatus.equals("APPROVED")) {
            leave.setApproverComment(dto.getComment());
            if (!leave.getLeaveType().equals("UNPAID")) {
                deductBalance(leave.getEmployeeId(), leave.getLeaveType(), leave.getNumberOfDays());
            } else {
                addUnpaidLeave(leave.getEmployeeId(), leave.getNumberOfDays());
            }
        } else if (newStatus.equals("REJECTED")) {
            leave.setRejectionReason(dto.getComment());
        } else {
            throw new RuntimeException("Status must be APPROVED or REJECTED");
        }

        return leaveRequestRepository.save(leave);
    }

    // ── Admin views all leaves ──────────────────────────────────────────────
    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    // ── Leave balance ────────────────────────────────────────────────────────
    public LeaveBalance getBalance(String employeeEmail) {
        User employee = userRepository.findByEmail(employeeEmail)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        int year = Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), year)
            .orElseGet(() -> createDefaultBalance(employee.getId(), year));
    }

    // ── Private helpers ──────────────────────────────────────────────────────
    private void checkAndValidateBalance(String employeeId, String leaveType, int days) {
        int year = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository
            .findByEmployeeIdAndYear(employeeId, year)
            .orElseGet(() -> createDefaultBalance(employeeId, year));

        int remaining = switch (leaveType) {
            case "CASUAL" -> balance.getCasualRemaining();
            case "SICK"   -> balance.getSickRemaining();
            case "EARNED" -> balance.getEarnedRemaining();
            default -> throw new RuntimeException("Unknown leave type: " + leaveType);
        };

        if (days > remaining) {
            throw new RuntimeException(
                "Insufficient " + leaveType + " leave balance. Available: " + remaining + " days");
        }
    }

    private void deductBalance(String employeeId, String leaveType, int days) {
        int year = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository
            .findByEmployeeIdAndYear(employeeId, year)
            .orElseGet(() -> createDefaultBalance(employeeId, year));

        switch (leaveType) {
            case "CASUAL" -> balance.setCasualUsed(balance.getCasualUsed() + days);
            case "SICK"   -> balance.setSickUsed(balance.getSickUsed() + days);
            case "EARNED" -> balance.setEarnedUsed(balance.getEarnedUsed() + days);
        }
        leaveBalanceRepository.save(balance);
    }

    private void restoreBalance(String employeeId, String leaveType, int days) {
        int year = Year.now().getValue();
        leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year).ifPresent(balance -> {
            switch (leaveType) {
                case "CASUAL" -> balance.setCasualUsed(Math.max(0, balance.getCasualUsed() - days));
                case "SICK"   -> balance.setSickUsed(Math.max(0, balance.getSickUsed() - days));
                case "EARNED" -> balance.setEarnedUsed(Math.max(0, balance.getEarnedUsed() - days));
            }
            leaveBalanceRepository.save(balance);
        });
    }

    private void addUnpaidLeave(String employeeId, int days) {
        int year = Year.now().getValue();
        leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year).ifPresent(balance -> {
            balance.setUnpaidUsed(balance.getUnpaidUsed() + days);
            leaveBalanceRepository.save(balance);
        });
    }

    private LeaveBalance createDefaultBalance(String employeeId, int year) {
        LeaveBalance balance = LeaveBalance.builder()
            .employeeId(employeeId).year(year).build();
        return leaveBalanceRepository.save(balance);
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate date = start;
        while (!date.isAfter(end)) {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) count++;
            date = date.plusDays(1);
        }
        return count;
    }
}
