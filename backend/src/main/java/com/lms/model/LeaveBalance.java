package com.lms.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "leave_balances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {

    @Id
    private String id;

    private String employeeId;

    private int year;

    // Casual Leave
    @Builder.Default
    private int casualTotal = 12;
    @Builder.Default
    private int casualUsed = 0;

    // Sick Leave
    @Builder.Default
    private int sickTotal = 7;
    @Builder.Default
    private int sickUsed = 0;

    // Earned Leave
    @Builder.Default
    private int earnedTotal = 15;
    @Builder.Default
    private int earnedUsed = 0;

    // Unpaid Leave (no cap)
    @Builder.Default
    private int unpaidUsed = 0;

    public int getCasualRemaining() {
        return casualTotal - casualUsed;
    }

    public int getSickRemaining() {
        return sickTotal - sickUsed;
    }

    public int getEarnedRemaining() {
        return earnedTotal - earnedUsed;
    }
}
