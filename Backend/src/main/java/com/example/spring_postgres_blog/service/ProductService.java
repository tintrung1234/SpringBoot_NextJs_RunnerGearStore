package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.Product;
import com.example.spring_postgres_blog.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> searchProduct(String query, String category) {
        if (category != null && !category.isEmpty()) {
            return productRepository.findByCategoryIgnoreCase(category);
        } else if (query != null && !query.isEmpty()) {
            return productRepository.searchByQuery(query);
        } else {
            return productRepository.findAll();
        }
    }

    private String toSlug(String input) {
        String nowhitespace = Pattern.compile("\\s").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("").toLowerCase(Locale.ROOT);
        return slug;
    }

    public Product createProduct(Product product) {
        String baseSlug = toSlug(product.getTitle());
        String slug = baseSlug;
        int count = 1;

        // Make sure slug is unique
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }

        product.setSlug(slug);
        return productRepository.save(product);
    }

    public Product updateProduct(String slug, Product updatedProduct) {
        return productRepository.findBySlug(slug).map(product -> {
            product.setTitle(updatedProduct.getTitle());
            product.setDescription(updatedProduct.getDescription());
            product.setCategory(updatedProduct.getCategory());
            product.setDiscount(updatedProduct.getDiscount());
            product.setPrice(updatedProduct.getPrice());
            product.setViews(updatedProduct.getViews());
            product.setRating(updatedProduct.getRating());
            product.setUrl(updatedProduct.getUrl());

            // Only update image if new one is provided
            if (updatedProduct.getImageUrl() != null && !updatedProduct.getImageUrl().isEmpty()) {
                product.setImageUrl(updatedProduct.getImageUrl());
                product.setImagePublicId(updatedProduct.getImagePublicId());
            }

            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public void deleteProductBySlug(String slug) {
        productRepository.findBySlug(slug).ifPresent(product -> {
            productRepository.delete(product);
        });
    }

    public List<Product> getTop2DiscountProducts() {
        return productRepository.findTop2ByOrderByDiscountDesc();
    }

    public List<Product> getDiscountProducts() {
        return productRepository.findAllByOrderByDiscountDesc();
    }
}