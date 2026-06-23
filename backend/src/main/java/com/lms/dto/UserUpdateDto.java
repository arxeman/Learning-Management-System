package com.lms.dto;

import lombok.Data;

@Data
public class UserUpdateDto {
    private String name;
    private String department;
    private String managerId;
    private String role;
    private Boolean active;
}
