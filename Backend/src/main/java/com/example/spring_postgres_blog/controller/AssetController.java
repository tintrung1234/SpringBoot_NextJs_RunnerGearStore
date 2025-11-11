package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Asset;
import com.example.spring_postgres_blog.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @PostMapping
    public ResponseEntity<?> createAsset(@RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Asset asset = assetService.createAsset(file);
            return ResponseEntity.status(201).body(asset);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating Asset: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Long id) {
        boolean deleted = assetService.deleteAsset(id);
        if (!deleted) {
            return ResponseEntity.status(404).body("Asset not found");
        }
        return ResponseEntity.ok("Asset deleted successfully");
    }
}
