package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.service.PostService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {
        return postService.searchPosts(q, category);
    }

    @GetMapping("/category/{category}")
    public List<Post> getPostsByCategory(@PathVariable String category) {
        return postService.getPostsByCategory(category);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Post> getPostDetail(@PathVariable String slug) {
        return postService.getPostBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/newest")
    public List<Post> getPostsNewest() {
        return postService.getPostsNewest();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("content") String content,
            @RequestParam("slug") String slug,
            @RequestParam(value = "metaTitle", required = false) String metaTitle,
            @RequestParam(value = "metaDescription", required = false) String metaDescription,
            @RequestParam(value = "metaKeywords", required = false) String metaKeywords,
            @RequestParam(value = "metaURL", required = false) String metaURL,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Post post = new Post();
            post.setTitle(title);
            post.setDescription(description);
            post.setCategory(category);
            post.setContent(content);
            post.setSlug(slug);
            post.setMetaTitle(metaTitle);
            post.setMetaDescription(metaDescription);
            post.setMetaKeywords(metaKeywords);
            post.setMetaURL(metaURL);

            Post createdPost = postService.createPost(post, image);
            return ResponseEntity.status(201).body(createdPost);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating post: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{slug}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updatePost(
            @PathVariable String slug,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("content") String content,
            @RequestParam("slug") String newSlug,
            @RequestParam(value = "metaTitle", required = false) String metaTitle,
            @RequestParam(value = "metaDescription", required = false) String metaDescription,
            @RequestParam(value = "metaKeywords", required = false) String metaKeywords,
            @RequestParam(value = "metaURL", required = false) String metaURL,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Post post = new Post();
            post.setTitle(title);
            post.setDescription(description);
            post.setCategory(category);
            post.setContent(content);
            post.setSlug(newSlug);
            post.setMetaTitle(metaTitle);
            post.setMetaDescription(metaDescription);
            post.setMetaKeywords(metaKeywords);
            post.setMetaURL(metaURL);

            Post updated = postService.updatePost(slug, post, image);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error uploading image: " + e.getMessage());
        }
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<?> deletePost(@PathVariable String slug) {
        try {
            postService.deletePost(slug);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/top1")
    public Post getTop1Blog() {
        return postService.getTop1Blog();
    }

    @PutMapping("/{slug}/view")
    public Post increaseView(@PathVariable String slug) {
        return postService.increaseView(slug);
    }
}