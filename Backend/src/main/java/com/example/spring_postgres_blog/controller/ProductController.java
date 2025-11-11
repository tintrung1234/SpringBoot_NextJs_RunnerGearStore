package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Product;
import com.example.spring_postgres_blog.service.CloudinaryService;
import com.example.spring_postgres_blog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CloudinaryService cloudinaryService;

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

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestParam("title") String title,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam("discount") Double discount,
            @RequestParam("views") Integer views,
            @RequestParam("rating") Double rating,
            @RequestParam("category") String category,
            @RequestParam("slug") String slug,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        Product product = new Product();
        product.setTitle(title);
        product.setPrice(price);
        product.setDescription(description);
        product.setDiscount(discount);
        product.setViews(views);
        product.setRating(rating);
        product.setCategory(category);
        product.setUrl(slug);

        // Handle image upload if provided
        if (image != null && !image.isEmpty()) {
            Map uploadResult = cloudinaryService.upload(image);
            product.setImageUrl((String) uploadResult.get("url"));
            product.setImagePublicId((String) uploadResult.get("public_id"));
        }

        Product result = productService.createProduct(product);
        return ResponseEntity.status(201).body(result);
    }

    @PutMapping(value = "/update/{slug}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable String slug,
            @RequestParam("title") String title,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam("discount") Double discount,
            @RequestParam("views") Integer views,
            @RequestParam("rating") Double rating,
            @RequestParam("category") String category,
            @RequestParam("slug") String slugParam,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Product updatedProduct = new Product();
            updatedProduct.setTitle(title);
            updatedProduct.setPrice(price);
            updatedProduct.setDescription(description);
            updatedProduct.setDiscount(discount);
            updatedProduct.setViews(views);
            updatedProduct.setRating(rating);
            updatedProduct.setCategory(category);
            updatedProduct.setUrl(slugParam);

            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                // Get existing product to delete old image if exists
                Optional<Product> existingProduct = productService.getProductBySlug(slug);
                if (existingProduct.isPresent() && existingProduct.get().getImagePublicId() != null) {
                    cloudinaryService.delete(existingProduct.get().getImagePublicId());
                }

                Map uploadResult = cloudinaryService.upload(image);
                updatedProduct.setImageUrl((String) uploadResult.get("url"));
                updatedProduct.setImagePublicId((String) uploadResult.get("public_id"));
            }

            Product product = productService.updateProduct(slug, updatedProduct);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error uploading image: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{slug}")
    public ResponseEntity<?> deleteProduct(@PathVariable String slug) {
        try {
            // Get product to delete image from Cloudinary
            Optional<Product> product = productService.getProductBySlug(slug);
            if (product.isPresent()) {
                if (product.get().getImagePublicId() != null) {
                    cloudinaryService.delete(product.get().getImagePublicId());
                }
                productService.deleteProductBySlug(slug);
                return ResponseEntity.ok("Product deleted successfully");
            }
            return ResponseEntity.status(404).body("Product not found");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error deleting product: " + e.getMessage());
        }
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