package com.lms.controller;

import com.lms.dto.ApiResponse;
import com.lms.dto.LeaveRequestDto;
import com.lms.dto.UpdateLeaveStatusDto;
import com.lms.model.LeaveBalance;
import com.lms.model.LeaveRequest;
import com.lms.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    // ── Apply for leave (Employee / Manager) ─────────────────────────────────
    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequest>> applyLeave(
            @Valid @RequestBody LeaveRequestDto dto,
            Authentication auth) {
        try {
            LeaveRequest leave = leaveService.applyLeave(auth.getName(), dto);
            return ResponseEntity.ok(ApiResponse.success("Leave applied successfully", leave));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── My leave history ─────────────────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getMyLeaves(Authentication auth) {
        List<LeaveRequest> leaves = leaveService.getMyLeaves(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    // ── My leave balance ──────────────────────────────────────────────────────
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<LeaveBalance>> getMyBalance(Authentication auth) {
        LeaveBalance balance = leaveService.getBalance(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(balance));
    }

    // ── Cancel own leave ──────────────────────────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveRequest>> cancelLeave(
            @PathVariable String id,
            Authentication auth) {
        try {
            LeaveRequest leave = leaveService.cancelLeave(id, auth.getName());
            return ResponseEntity.ok(ApiResponse.success("Leave cancelled", leave));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── Manager: view team leaves ─────────────────────────────────────────────
    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getTeamLeaves(Authentication auth) {
        List<LeaveRequest> leaves = leaveService.getTeamLeaves(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    // ── Manager: view pending team leaves ────────────────────────────────────
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getPendingLeaves(Authentication auth) {
        List<LeaveRequest> leaves = leaveService.getPendingTeamLeaves(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    // ── Manager/Admin: approve or reject a leave ──────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequest>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateLeaveStatusDto dto,
            Authentication auth) {
        try {
            LeaveRequest leave = leaveService.updateLeaveStatus(id, dto, auth.getName());
            return ResponseEntity.ok(ApiResponse.success("Leave status updated", leave));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── Admin: all leaves ─────────────────────────────────────────────────────
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getAllLeaves() {
        List<LeaveRequest> leaves = leaveService.getAllLeaves();
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }
}
