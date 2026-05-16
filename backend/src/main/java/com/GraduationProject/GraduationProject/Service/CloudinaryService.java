package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.CloudinaryUploadResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;

@Service
public class CloudinaryService {

    private static final long MAX_IMAGE_SIZE_BYTES = 8L * 1024L * 1024L;
    private static final long MAX_DOCUMENT_SIZE_BYTES = 8L * 1024L * 1024L;
    private static final String DEFAULT_UPLOAD_FOLDER = "petnexus/uploads";
    private static final String CHAT_UPLOAD_FOLDER = "petnexus/chat";
    private static final String VERIFICATION_UPLOAD_FOLDER = "petnexus/verification";

    private final RestTemplate restTemplate = new RestTemplate();
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret
    ) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public String uploadChatImage(MultipartFile file) {
        return uploadImage(file, CHAT_UPLOAD_FOLDER);
    }

    public String uploadImage(MultipartFile file, String folder) {
        return uploadImageWithMetadata(file, folder).secureUrl();
    }

    public CloudinaryUploadResult uploadImageWithMetadata(MultipartFile file, String folder) {
        validateImage(file);
        return upload(file, folder, "image", "image");
    }

    public CloudinaryUploadResult uploadVerificationDocument(MultipartFile file, Long providerId) {
        validateDocument(file);
        String providerFolder = providerId == null
                ? VERIFICATION_UPLOAD_FOLDER
                : VERIFICATION_UPLOAD_FOLDER + "/" + providerId;
        String resourceType = isImageOrPdf(file.getContentType()) ? "image" : "raw";

        return upload(file, providerFolder, resourceType, "verification-document");
    }

    public String buildVerificationPreviewUrl(String documentUrl, String publicId) {
        if (!isCloudinaryImagePdf(documentUrl) || publicId == null || publicId.isBlank()) {
            return documentUrl;
        }

        String previewPublicId = publicId.endsWith(".pdf")
                ? publicId.substring(0, publicId.length() - 4)
                : publicId;

        return "https://res.cloudinary.com/" + cloudName
                + "/image/upload/pg_1,f_jpg,q_auto/"
                + previewPublicId
                + ".jpg";
    }

    private CloudinaryUploadResult upload(MultipartFile file, String folder, String resourceType, String defaultFilename) {
        String uploadFolder = normalizeFolder(folder);

        try {
            long timestamp = Instant.now().getEpochSecond();
            Map<String, String> signedParams = new TreeMap<>();
            signedParams.put("folder", uploadFolder);
            signedParams.put("timestamp", String.valueOf(timestamp));

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new NamedByteArrayResource(file.getBytes(), file.getOriginalFilename(), defaultFilename));
            body.add("api_key", apiKey);
            body.add("timestamp", String.valueOf(timestamp));
            body.add("folder", uploadFolder);
            body.add("signature", sign(signedParams));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/" + resourceType + "/upload";
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    uploadUrl,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Object secureUrl = response.getBody() != null ? response.getBody().get("secure_url") : null;
            if (!(secureUrl instanceof String imageUrl) || imageUrl.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary did not return a secure URL");
            }

            Object publicId = response.getBody() != null ? response.getBody().get("public_id") : null;
            if (!(publicId instanceof String cloudinaryPublicId) || cloudinaryPublicId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary did not return a public ID");
            }

            return new CloudinaryUploadResult(imageUrl, cloudinaryPublicId);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload file to Cloudinary");
        }
    }

    public boolean isManagedImageUrl(String imageUrl) {
        return imageUrl != null
                && imageUrl.startsWith("https://res.cloudinary.com/" + cloudName + "/image/upload/");
    }

    private String normalizeFolder(String folder) {
        if (folder == null || folder.trim().isBlank()) {
            return DEFAULT_UPLOAD_FOLDER;
        }

        String normalized = folder.trim()
                .replace("\\", "/")
                .replaceAll("[^A-Za-z0-9_/-]", "")
                .replaceAll("/{2,}", "/");

        if (normalized.isBlank()) {
            return DEFAULT_UPLOAD_FOLDER;
        }

        if (!normalized.startsWith("petnexus/")) {
            return "petnexus/" + normalized;
        }

        return normalized;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be smaller than 8MB");
        }
    }

    private void validateDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification document is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isSupportedDocumentContentType(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only images, PDFs, and Word documents are allowed");
        }

        if (file.getSize() > MAX_DOCUMENT_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification document must be smaller than 8MB");
        }
    }

    private boolean isSupportedDocumentContentType(String contentType) {
        return contentType.startsWith("image/")
                || contentType.equals("application/pdf")
                || contentType.equals("application/msword")
                || contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    private boolean isImageOrPdf(String contentType) {
        if (contentType == null) {
            return false;
        }

        String normalized = contentType.toLowerCase();
        return normalized.startsWith("image/") || normalized.equals("application/pdf");
    }

    private boolean isCloudinaryImagePdf(String documentUrl) {
        if (documentUrl == null || documentUrl.isBlank()) {
            return false;
        }

        String normalizedUrl = documentUrl.split("\\?", 2)[0].toLowerCase();
        return normalizedUrl.startsWith("https://res.cloudinary.com/" + cloudName + "/image/upload/")
                && normalizedUrl.endsWith(".pdf");
    }

    private String sign(Map<String, String> params) {
        StringBuilder payload = new StringBuilder();
        params.forEach((key, value) -> {
            if (!payload.isEmpty()) {
                payload.append("&");
            }
            payload.append(key).append("=").append(value);
        });
        payload.append(apiSecret);

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(payload.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Image signing is unavailable");
        }
    }

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        NamedByteArrayResource(byte[] byteArray, String filename, String defaultFilename) {
            super(byteArray);
            this.filename = filename == null || filename.isBlank() ? defaultFilename : filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}
