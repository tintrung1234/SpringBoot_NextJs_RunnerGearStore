package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Asset;
import com.example.spring_postgres_blog.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<?> getAllAssets() {
        try {
            List<Asset> assets = assetService.getAllAssets();
            return ResponseEntity.ok(assets);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching assets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAsset(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "File is required");
                return ResponseEntity.badRequest().body(error);
            }

            Asset asset = assetService.createAsset(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(asset);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error creating asset: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Long id) {
        try {
            boolean deleted = assetService.deleteAsset(id);
            if (!deleted) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Asset not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            Map<String, String> response = new HashMap<>();
            response.put("message", "Asset deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting asset: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}