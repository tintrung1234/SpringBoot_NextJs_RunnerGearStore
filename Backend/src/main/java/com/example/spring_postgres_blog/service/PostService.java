package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

import com.example.spring_postgres_blog.model.PostView;
import com.example.spring_postgres_blog.repository.PostViewRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;

    private final PostViewRepository postViewRepository;

    public PostService(PostRepository postRepository, PostViewRepository postViewRepository) {
        this.postRepository = postRepository;
        this.postViewRepository = postViewRepository;
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

    public Post createPost(Post post) {
        post.setViews(0);
        post.setCreatedAt(LocalDateTime.now());

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

    public Post updatePost(String slug, Post newPost) {
        return postRepository.findBySlug(slug).map(post -> {
            post.setTitle(newPost.getTitle());
            post.setDescription(newPost.getDescription());
            post.setCategory(newPost.getCategory());
            post.setViews(newPost.getViews());
            post.setContent(newPost.getContent());
            post.setSlug(newPost.getSlug());
            post.setMetaTitle(newPost.getMetaTitle());
            post.setMetaDescription(newPost.getMetaDescription());
            post.setMetaKeywords(newPost.getMetaKeywords());
            post.setMetaURL(newPost.getMetaURL());
            post.setImageUrl(newPost.getImageUrl());
            return postRepository.save(post);
        }).orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public void deletePost(String slug) {
        postRepository.findBySlug(slug).ifPresent(postRepository::delete);
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

