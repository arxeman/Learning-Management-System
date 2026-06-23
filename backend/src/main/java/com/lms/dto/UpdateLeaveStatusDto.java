package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateLeaveStatusDto {
    @NotBlank
    private String status; // APPROVED or REJECTED

    private String comment; // Optional comment or rejection reason
}
