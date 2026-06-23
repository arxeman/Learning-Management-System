package com.lms.service;

import com.lms.dto.LoginRequest;
import com.lms.dto.LoginResponse;
import com.lms.dto.RegisterRequest;
import com.lms.model.LeaveBalance;
import com.lms.model.User;
import com.lms.repository.LeaveBalanceRepository;
import com.lms.repository.UserRepository;
import com.lms.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()
            )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return LoginResponse.builder()
            .token(jwt)
            .type("Bearer")
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .department(user.getDepartment())
            .build();
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken: " + request.getEmail());
        }

        String role = (request.getRole() != null && !request.getRole().isBlank())
            ? request.getRole() : "ROLE_EMPLOYEE";

        // Fetch manager name if managerId is provided
        String managerName = null;
        if (request.getManagerId() != null) {
            managerName = userRepository.findById(request.getManagerId())
                .map(User::getName).orElse(null);
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(role)
            .department(request.getDepartment())
            .managerId(request.getManagerId())
            .managerName(managerName)
            .active(true)
            .createdAt(LocalDateTime.now())
            .build();

        User savedUser = userRepository.save(user);

        // Initialize leave balance for the new user
        initializeLeaveBalance(savedUser.getId());

        return savedUser;
    }

    private void initializeLeaveBalance(String employeeId) {
        int currentYear = Year.now().getValue();
        LeaveBalance balance = LeaveBalance.builder()
            .employeeId(employeeId)
            .year(currentYear)
            .casualTotal(12)
            .casualUsed(0)
            .sickTotal(7)
            .sickUsed(0)
            .earnedTotal(15)
            .earnedUsed(0)
            .unpaidUsed(0)
            .build();
        leaveBalanceRepository.save(balance);
    }
}
