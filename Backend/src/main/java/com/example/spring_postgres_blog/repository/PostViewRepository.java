package com.example.spring_postgres_blog.repository;

import com.example.spring_postgres_blog.model.PostView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostViewRepository extends JpaRepository<PostView, Long> {
}
