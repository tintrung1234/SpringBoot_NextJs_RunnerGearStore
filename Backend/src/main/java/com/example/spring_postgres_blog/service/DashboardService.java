package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.model.Product;
import com.example.spring_postgres_blog.repository.PostRepository;
import com.example.spring_postgres_blog.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PostRepository postRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Count totals
        long totalProducts = productRepository.count();
        long totalPosts = postRepository.count();

        // Calculate total views
        long totalProductViews = productRepository.findAll()
                .stream()
                .mapToLong(p -> p.getViews() != null ? p.getViews() : 0)
                .sum();

        long totalPostViews = postRepository.findAll()
                .stream()
                .mapToLong(p -> p.getViews() != null ? p.getViews() : 0)
                .sum();

        stats.put("totalProducts", totalProducts);
        stats.put("totalPosts", totalPosts);
        stats.put("totalProductViews", totalProductViews);
        stats.put("totalPostViews", totalPostViews);

        return stats;
    }

    public List<Product> getRecentProducts() {
        return productRepository.findTop5ByOrderByCreatedAtDesc();
    }

    public List<Post> getRecentPosts() {
        return postRepository.findTop5Newest();
    }

    public List<Product> getTopProductsByViews() {
        return productRepository.findTop5ByOrderByViewsDesc();
    }
}