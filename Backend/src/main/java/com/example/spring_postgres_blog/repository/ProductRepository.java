package com.example.spring_postgres_blog.repository;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category);

    Optional<Product> findBySlug(String slug);

    // Search across multiple fields
    @Query("""
                SELECT p FROM Product p
                WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<Product> searchByQuery(String query);

    @Query(value = "SELECT * FROM product ORDER BY discount DESC LIMIT 2", nativeQuery = true)
    List<Product> findTop2ByOrderByDiscountDesc();

    @Query(value = "SELECT * FROM product WHERE discount > 0 ORDER BY discount DESC LIMIT 20", nativeQuery = true)
    List<Product> findAllByOrderByDiscountDesc();

    boolean existsBySlug(String slug);
}
