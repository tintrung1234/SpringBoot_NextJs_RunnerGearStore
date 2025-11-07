package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Post;
import com.example.spring_postgres_blog.model.Product;
import com.example.spring_postgres_blog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/search")
    public List<Product> searchProduct(@RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {
        return productService.searchProduct(q, category);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/detail/{slug}")
    public ResponseEntity<Product> getProductDetail(@PathVariable String slug) {
        return productService.getProductBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.status(201).body(productService.createProduct(product));
    }

    @PutMapping("/update/{slug}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        try {
            Product product = productService.updateProduct(id, updatedProduct);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{slug}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    @GetMapping("/top2product")
    public ResponseEntity<List<Product>> getTop2Discount() {
        return ResponseEntity.ok(productService.getTop2DiscountProducts());
    }

    @GetMapping("/getdiscountproducts")
    public ResponseEntity<List<Product>> getDiscountProducts() {
        return ResponseEntity.ok(productService.getDiscountProducts());
    }
}
