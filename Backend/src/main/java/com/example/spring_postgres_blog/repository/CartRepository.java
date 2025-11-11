package com.example.spring_postgres_blog.repository;

import com.example.spring_postgres_blog.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
}
