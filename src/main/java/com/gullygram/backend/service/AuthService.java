package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.*;
import com.gullygram.backend.dto.response.AuthResponse;
import com.gullygram.backend.entity.OtpVerification;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.UnauthorizedException;
import com.gullygram.backend.repository.OtpVerificationRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.otp.expiration-minutes}")
    private int otpExpirationMinutes;

    @Value("${app.otp.length}")
    private int otpLength;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Validate input
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getPhone())) {
            throw new BadRequestException("Either email or phone is required");
        }

        if (!StringUtils.hasText(request.getPassword())) {
            throw new BadRequestException("Password is required for signup");
        }

        // Check if user already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone already registered");
        }

        if (userProfileRepository.existsByAlias(request.getAlias())) {
            throw new BadRequestException("Alias already taken");
        }

        // Create user
        User user = User.builder()
            .email(request.getEmail())
            .phone(request.getPhone())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .status(User.UserStatus.ACTIVE)
            .accountType(
                "COMPANY".equalsIgnoreCase(request.getAccountType()) 
                ? User.AccountType.COMPANY 
                : User.AccountType.INDIVIDUAL
            )
            .marketingCategory(request.getMarketingCategory())
            .build();

        user = userRepository.save(user);

        // Create profile (matching week_1goal working implementation)
        UserProfile profile = UserProfile.builder()
            .user(user)
            .alias(request.getAlias())
            .realName(request.getRealName())
            .defaultRadiusKm(10)
            .build();

        userProfileRepository.save(profile);


        // Generate JWT
        String token = jwtUtil.generateToken(user.getId());

        return AuthResponse.builder()
            .accessToken(token)
            .userId(user.getId())
            .alias(profile.getAlias())
            .profileComplete(StringUtils.hasText(profile.getRealName()))
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Validate input
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getPhone())) {
            throw new BadRequestException("Either email or phone is required");
        }

        // Find user
        User user = null;
        if (StringUtils.hasText(request.getEmail())) {
            user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        } else if (StringUtils.hasText(request.getPhone())) {
            user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        }

        // Verify password
        if (user.getPasswordHash() == null || 
            !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Get profile
        UserProfile profile = userProfileRepository.findById(user.getId())
            .orElseThrow(() -> new BadRequestException("Profile not found"));

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId());

        return AuthResponse.builder()
            .accessToken(token)
            .userId(user.getId())
            .alias(profile.getAlias())
            .profileComplete(StringUtils.hasText(profile.getRealName()))
            .build();
    }

    @Transactional
    public void requestOtp(OtpRequest request) {
        // Check rate limiting (max 3 OTPs per 5 minutes)
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        var recentOtps = otpVerificationRepository.findByPhoneAndCreatedAtAfter(
            request.getPhone(), fiveMinutesAgo
        );

        if (recentOtps.size() >= 3) {
            throw new BadRequestException("Too many OTP requests. Please try again later.");
        }

        // Generate OTP
        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        OtpVerification otp = OtpVerification.builder()
            .phone(request.getPhone())
            .otpCode(otpCode)
            .verified(false)
            .expiresAt(expiresAt)
            .build();

        otpVerificationRepository.save(otp);

        // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
        log.info("OTP for {}: {}", request.getPhone(), otpCode);
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        // Find valid OTP
        OtpVerification otp = otpVerificationRepository
            .findTopByPhoneAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                request.getPhone(), LocalDateTime.now()
            )
            .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        // Verify OTP code
        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            throw new BadRequestException("Invalid OTP code");
        }

        // Mark OTP as verified
        otp.setVerified(true);
        otp.setVerifiedAt(LocalDateTime.now());
        otpVerificationRepository.save(otp);

        // Check if user exists
        User user = userRepository.findByPhone(request.getPhone()).orElse(null);

        if (user == null) {
            // Create new user
            if (userProfileRepository.existsByAlias(request.getAlias())) {
                throw new BadRequestException("Alias already taken");
            }

            user = User.builder()
                .phone(request.getPhone())
                .status(User.UserStatus.ACTIVE)
                .build();

            user = userRepository.save(user);

            // Create profile (matching week_1goal working implementation)
            UserProfile profile = UserProfile.builder()
                .user(user)
                .alias(request.getAlias())
                .realName(request.getRealName())
                .defaultRadiusKm(10)
                .build();

            userProfileRepository.save(profile);

        }

        // Get profile
        UserProfile profile = userProfileRepository.findById(user.getId())
            .orElseThrow(() -> new BadRequestException("Profile not found"));

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId());

        return AuthResponse.builder()
            .accessToken(token)
            .userId(user.getId())
            .alias(profile.getAlias())
            .profileComplete(StringUtils.hasText(profile.getRealName()))
            .build();
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = random.nextInt((int) Math.pow(10, otpLength));
        return String.format("%0" + otpLength + "d", otp);
    }
}
