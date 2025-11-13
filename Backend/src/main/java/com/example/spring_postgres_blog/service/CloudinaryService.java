package com.example.spring_postgres_blog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary
     * 
     * @param file MultipartFile to upload
     * @return Map containing url and public_id
     * @throws IOException if upload fails
     */
    public Map upload(MultipartFile file) throws IOException {
        String publicId = "products/" + UUID.randomUUID().toString();

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "folder", "runner-gear-store/products",
                        "resource_type", "auto",
                        "width", 800,
                        "height", 800,
                        "crop", "limit",
                        "quality", "auto:good"));

        return uploadResult;
    }

    /**
     * Delete image from Cloudinary by public_id
     * 
     * @param publicId Public ID of the image to delete
     * @throws IOException if deletion fails
     */
    public void delete(String publicId) throws IOException {
        if (publicId != null && !publicId.isEmpty()) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    /**
     * Upload image with custom options
     * 
     * @param file   MultipartFile to upload
     * @param folder Folder name in Cloudinary
     * @param width  Max width
     * @param height Max height
     * @return Map containing url and public_id
     * @throws IOException if upload fails
     */
    public Map uploadWithOptions(MultipartFile file, String folder, int width, int height) throws IOException {
        String publicId = folder + "/" + UUID.randomUUID().toString();

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "folder", "runner-gear-store/" + folder,
                        "resource_type", "auto",
                        "width", width,
                        "height", height,
                        "crop", "limit",
                        "quality", "auto:best"));

        return uploadResult;
    }

    /**
     * Get optimized image URL
     * 
     * @param publicId Public ID of the image
     * @param width    Desired width
     * @param height   Desired height
     * @return Optimized image URL
     */
    public String getOptimizedUrl(String publicId, int width, int height) {
        return cloudinary.url()
                .transformation((Transformation) ObjectUtils.asMap(
                        "width", width,
                        "height", height,
                        "crop", "fill",
                        "quality", "auto",
                        "fetch_format", "auto"))
                .generate(publicId);
    }
}