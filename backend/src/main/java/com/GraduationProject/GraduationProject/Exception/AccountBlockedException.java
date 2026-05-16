package com.GraduationProject.GraduationProject.Exception;

import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;

public class AccountBlockedException extends RuntimeException {

    private final UserAccountStatus accountStatus;
    private final String reason;

    public AccountBlockedException(UserAccountStatus accountStatus, String reason) {
        super(buildMessage(accountStatus));
        this.accountStatus = accountStatus;
        this.reason = reason;
    }

    public UserAccountStatus getAccountStatus() {
        return accountStatus;
    }

    public String getReason() {
        return reason;
    }

    private static String buildMessage(UserAccountStatus accountStatus) {
        if (accountStatus == UserAccountStatus.BANNED) {
            return "Your account has been banned by an admin.";
        }

        if (accountStatus == UserAccountStatus.SUSPENDED) {
            return "Your account has been suspended by an admin.";
        }

        return "Your account is not active.";
    }
}
