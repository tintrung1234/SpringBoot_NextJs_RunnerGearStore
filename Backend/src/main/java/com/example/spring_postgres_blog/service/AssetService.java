package com.example.spring_postgres_blog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.spring_postgres_blog.model.Asset;
import com.example.spring_postgres_blog.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private Cloudinary cloudinary;

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
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "assets"));
            image_url = uploadResult.get(uploadResult.get("secure_url")).toString();
            image_public_id = uploadResult.get("public_id").toString();
        }

        Asset asset = new Asset(image_url, image_public_id);
        return assetRepository.save(asset);
    }

    public boolean deleteAsset(Long id) {
        Optional<Asset> asset = assetRepository.findById(id);
        if (asset.isEmpty())
            return false;

        assetRepository.deleteById(id);
        return true;
    }
}
