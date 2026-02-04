# Implementation Plan - Phase 1: Trust & Identity 🛡️

## Goal
Implement the technical foundation for the "Whitefield Strategy": verifying users based on their workplace (Tech Parks) and residential communities. This is critical for the "Trust Graph".

## User Review Required
> [!IMPORTANT]
> This creates a new `VerificationService` and modifies the `User` table. Existing tokens might need to be refreshed if they rely on user status, though currently JWTs are stateless.

## Proposed Changes

### Backend

#### [MODIFY] [User.java](file:///Users/rupeshsingh/Gullygram/src/main/java/com/gullygram/backend/entity/User.java)
- Add `workplaceEmail` (String, unique).
- Add `workplaceName` (String).
- Add `isWorkplaceVerified` (boolean).
- Add `residentialCommunityId` (String/UUID).

#### [NEW] [VerificationService.java](file:///Users/rupeshsingh/Gullygram/src/main/java/com/gullygram/backend/service/VerificationService.java)
- Method `verifyWorkplace(userId, email)`:
    - Sends OTP to work email (mocked for now).
    - Checks domain whitelist (e.g., `google.com` -> `Google`).

#### [NEW] [WorkplaceWhitelist.java](file:///Users/rupeshsingh/Gullygram/src/main/java/com/gullygram/backend/model/WorkplaceWhitelist.java)
- Simple map of `domain -> Company Name`.
- Example: `"cisco.com" -> "Cisco Systems"`.

### Database
- Migration script to add columns to `users` table.

## Verification Plan

### Automated Tests
- **Unit Test**: `VerificationServiceTest` - Test domain mapping and mock OTP flow.
- **Integration Test**: Update `verify_week5_backend.sh` to include a test case for updating workplace info.

### Manual Verification
1.  **Signup Flow**: Create user.
2.  **Verify**: Call API `/api/verification/workplace` with `test@cisco.com`.
3.  **Check DB**: Confirm `workplace_name` is "Cisco Systems".
