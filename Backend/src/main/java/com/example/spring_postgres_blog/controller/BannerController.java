package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Banner;
import com.example.spring_postgres_blog.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createBanner(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is required");
            }

            Banner banner = bannerService.createBanner(file);
            return ResponseEntity.status(201).body(banner);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating banner: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        try {
            boolean deleted = bannerService.deleteBanner(id);
            if (!deleted) {
                return ResponseEntity.status(404).body("Banner not found");
            }
            return ResponseEntity.ok("Banner deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error deleting banner: " + e.getMessage());
        }
    }
}