package com.gullygram.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gullygram.backend.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;

@Service
@Slf4j
@ConditionalOnProperty(name = "storage.type", havingValue = "cloudinary")
public class CloudinaryStorageServiceImpl implements StorageService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        log.info("Initializing Cloudinary Storage Service for cloud: {}", cloudName);
        cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            // Cloudinary requires a File or bytes. Bytes is better for memory but File is safer for large files.
            // Let's use bytes directly to avoid temp files if possible, but the library handles it.
            // map options
            Map params = ObjectUtils.asMap(
                "folder", "gullygram/" + folder,
                "resource_type", "auto"
            );

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            
            // Return the secure URL
            String url = (String) uploadResult.get("secure_url");
            log.info("Uploaded file to Cloudinary: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        // Extract public_id from URL if possible, or just ignore.
        // Cloudinary deletion requires public_id.
        // For MVP, we might skip deletion or implement basic extraction logic.
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1570979139/gullygram/avatars/sample.jpg
        try {
            if (fileUrl != null && fileUrl.contains("cloudinary")) {
                // improved regex or logic needed for robust extraction
                log.info("Delete request for Cloudinary file: {} (Not fully implemented)", fileUrl);
            }
        } catch (Exception e) {
            log.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
        }
    }
}
