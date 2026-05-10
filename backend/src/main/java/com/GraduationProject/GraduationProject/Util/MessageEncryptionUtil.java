package com.GraduationProject.GraduationProject.Util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

/**
 * Utility class for AES-256 message encryption/decryption Implements end-to-end
 * encryption for secure message storage
 */
public class MessageEncryptionUtil {

    private static final String ALGORITHM = "AES";
    private static final int KEY_SIZE = 256;
    private static final String FIXED_KEY = "PetNexusSecurityKey1234567890AB"; // 32 bytes for AES-256

    /**
     * Generate a secret key for encryption
     */
    public static SecretKey generateKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
        keyGenerator.init(KEY_SIZE);
        return keyGenerator.generateKey();
    }

    /**
     * Get the fixed key used for the application
     */
    public static SecretKey getFixedKey() {
        byte[] decodedKey = FIXED_KEY.getBytes();
        return new SecretKeySpec(decodedKey, 0, decodedKey.length, ALGORITHM);
    }

    /**
     * Encrypt a message using AES-256
     */
    public static String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKey key = getFixedKey();
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting message", e);
        }
    }

    /**
     * Decrypt a message using AES-256
     */
    public static String decrypt(String encryptedText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKey key = getFixedKey();
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting message", e);
        }
    }

}
