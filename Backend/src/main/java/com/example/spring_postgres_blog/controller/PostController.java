package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return postService.createPost(post);
    }

    @PutMapping("/{slug}")
    public ResponseEntity<Post> updatePost(@PathVariable String slug, @RequestBody Post post) {
        try {
            Post updated = postService.updatePost(slug, post);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deletePost(@PathVariable String slug) {
        try {
            postService.deletePost(slug);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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
