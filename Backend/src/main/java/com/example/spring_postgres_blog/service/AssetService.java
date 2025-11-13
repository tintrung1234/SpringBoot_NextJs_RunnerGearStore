package com.example.spring_postgres_blog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.spring_postgres_blog.model.Asset;
import com.example.spring_postgres_blog.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Asset> getAllAssets() {
        return assetRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Asset::getCreatedAt).reversed())
                .toList();
    }

    public Asset createAsset(MultipartFile file) throws Exception {
        String image_url = "";
        String image_public_id = "";

        if (file != null && !file.isEmpty()) {
            // Use CloudinaryService for upload
            Map uploadResult = cloudinaryService.uploadWithOptions(file, "assets", 1200, 1200);
            image_url = (String) uploadResult.get("secure_url");
            image_public_id = (String) uploadResult.get("public_id");
        }

        Asset asset = new Asset(image_url, image_public_id);
        return assetRepository.save(asset);
    }

    public boolean deleteAsset(Long id) {
        Optional<Asset> asset = assetRepository.findById(id);
        if (asset.isEmpty())
            return false;

        // Delete from Cloudinary if public_id exists
        if (asset.get().getImagePublicId() != null && !asset.get().getImagePublicId().isEmpty()) {
            try {
                cloudinaryService.delete(asset.get().getImagePublicId());
            } catch (IOException e) {
                System.err.println("Error deleting image from Cloudinary: " + e.getMessage());
            }
        }

        assetRepository.deleteById(id);
        return true;
    }
}