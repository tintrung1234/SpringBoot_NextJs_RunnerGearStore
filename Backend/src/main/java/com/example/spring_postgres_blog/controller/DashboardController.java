package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/recent-products")
    public ResponseEntity<?> getRecentProducts() {
        return ResponseEntity.ok(dashboardService.getRecentProducts());
    }

    @GetMapping("/recent-posts")
    public ResponseEntity<?> getRecentPosts() {
        return ResponseEntity.ok(dashboardService.getRecentPosts());
    }

    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts() {
        return ResponseEntity.ok(dashboardService.getTopProductsByViews());
    }
}