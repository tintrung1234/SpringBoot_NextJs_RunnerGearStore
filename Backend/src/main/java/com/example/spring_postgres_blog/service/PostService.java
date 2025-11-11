package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import com.example.spring_postgres_blog.model.PostView;
import com.example.spring_postgres_blog.repository.PostViewRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final PostViewRepository postViewRepository;
    private final CloudinaryService cloudinaryService;

    public PostService(PostRepository postRepository, PostViewRepository postViewRepository,
            CloudinaryService cloudinaryService) {
        this.postRepository = postRepository;
        this.postViewRepository = postViewRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostBySlug(String slug) {
        return postRepository.findBySlug(slug);
    }

    public List<Post> searchPosts(String query, String category) {
        if (category != null && !category.isEmpty()) {
            return postRepository.findByCategory(category);
        } else if (query != null && !query.isEmpty()) {
            return postRepository.searchByTitleOrDescription(query);
        } else {
            return postRepository.findAll();
        }
    }

    public List<Post> getPostsByCategory(String category) {
        return postRepository.findByCategory(category);
    }

    public List<Post> getPostsNewest() {
        return postRepository.findTop5Newest();
    }

    public Post getTop1Blog() {
        return postRepository.findTop1Newest();
    }

    public Post createPost(Post post, MultipartFile image) throws IOException {
        post.setViews(0);
        post.setCreatedAt(LocalDateTime.now());

        // Handle image upload if provided
        if (image != null && !image.isEmpty()) {
            Map uploadResult = cloudinaryService.uploadWithOptions(image, "posts", 1200, 800);
            post.setImageUrl((String) uploadResult.get("secure_url"));
            post.setImagePublicId((String) uploadResult.get("public_id"));
        }

        // Khởi tạo 1 bản ghi view cho hôm nay = 0
        PostView viewToday = new PostView();
        viewToday.setDate(LocalDate.now());
        viewToday.setViewCount(0);
        viewToday.setPost(post);

        List<PostView> viewsList = new ArrayList<>();
        viewsList.add(viewToday);
        post.setViewsPerDay(viewsList);

        return postRepository.save(post);
    }

    public Post updatePost(String slug, Post newPost, MultipartFile image) throws IOException {
        return postRepository.findBySlug(slug).map(post -> {
            post.setTitle(newPost.getTitle());
            post.setDescription(newPost.getDescription());
            post.setCategory(newPost.getCategory());
            post.setContent(newPost.getContent());
            post.setSlug(newPost.getSlug());
            post.setMetaTitle(newPost.getMetaTitle());
            post.setMetaDescription(newPost.getMetaDescription());
            post.setMetaKeywords(newPost.getMetaKeywords());
            post.setMetaURL(newPost.getMetaURL());

            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                try {
                    // Delete old image if exists
                    if (post.getImagePublicId() != null && !post.getImagePublicId().isEmpty()) {
                        cloudinaryService.delete(post.getImagePublicId());
                    }

                    // Upload new image
                    Map uploadResult = cloudinaryService.uploadWithOptions(image, "posts", 1200, 800);
                    post.setImageUrl((String) uploadResult.get("secure_url"));
                    post.setImagePublicId((String) uploadResult.get("public_id"));
                } catch (IOException e) {
                    throw new RuntimeException("Error uploading image: " + e.getMessage());
                }
            }

            return postRepository.save(post);
        }).orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public void deletePost(String slug) {
        postRepository.findBySlug(slug).ifPresent(post -> {
            // Delete image from Cloudinary if exists
            if (post.getImagePublicId() != null && !post.getImagePublicId().isEmpty()) {
                try {
                    cloudinaryService.delete(post.getImagePublicId());
                } catch (IOException e) {
                    System.err.println("Error deleting image from Cloudinary: " + e.getMessage());
                }
            }
            postRepository.delete(post);
        });
    }

    public Post increaseView(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setViews(post.getViews() + 1);
        LocalDate today = LocalDate.now();

        // Tìm PostView hôm nay
        PostView todayView = post.getViewsPerDay().stream()
                .filter(v -> v.getDate().equals(today))
                .findFirst()
                .orElse(null);

        if (todayView == null) {
            todayView = new PostView();
            todayView.setDate(today);
            todayView.setViewCount(1);
            todayView.setPost(post);
            post.getViewsPerDay().add(todayView);
        } else {
            todayView.setViewCount(todayView.getViewCount() + 1);
        }

        // Lưu cả Post và PostView
        postViewRepository.save(todayView);
        return postRepository.save(post);
    }
}