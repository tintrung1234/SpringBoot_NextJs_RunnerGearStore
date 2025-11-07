package com.example.spring_postgres_blog.repository;

import com.example.spring_postgres_blog.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    List<Post> findByCategory(String category);

    @Query("SELECT p FROM Post p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Post> searchByTitleOrDescription(String query);

    @Query(value = "SELECT * FROM posts ORDER BY created_at DESC LIMIT 5", nativeQuery = true)
    List<Post> findTop5Newest();

    @Query(value = "SELECT * FROM posts ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Post findTop1Newest();
}
