package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.Banner;
import com.example.spring_postgres_blog.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Banner::getcreated_at).reversed())
                .toList();
    }

    public Banner createBanner(MultipartFile file) throws Exception {
        String image_url = "";
        String image_public_id = "";

        if (file != null && !file.isEmpty()) {
            // Use CloudinaryService with custom dimensions for banners (wide format)
            Map uploadResult = cloudinaryService.uploadWithOptions(file, "banners", 1920, 600);
            image_url = (String) uploadResult.get("secure_url");
            image_public_id = (String) uploadResult.get("public_id");
        }

        Banner banner = new Banner(image_url, image_public_id);
        return bannerRepository.save(banner);
    }

    public boolean deleteBanner(Long id) {
        Optional<Banner> banner = bannerRepository.findById(id);
        if (banner.isEmpty())
            return false;

        // Delete from Cloudinary if public_id exists
        if (banner.get().getimage_public_id() != null && !banner.get().getimage_public_id().isEmpty()) {
            try {
                cloudinaryService.delete(banner.get().getimage_public_id());
            } catch (IOException e) {
                System.err.println("Error deleting image from Cloudinary: " + e.getMessage());
            }
        }

        bannerRepository.deleteById(id);
        return true;
    }
}