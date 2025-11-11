package com.example.spring_postgres_blog.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "assets")
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url")
    private String image_url;

    @Column(name = "image_public_id")
    private String image_public_id;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Default no-argument constructor (required by JPA)
    public Asset() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public Asset(String image_url, String image_public_id) {
        this.image_url = image_url;
        this.image_public_id = image_public_id;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImage_url() {
        return image_url;
    }

    public String getImageUrl() {
        return image_url;
    }

    public void setImageUrl(String imageUrl) {
        this.image_url = imageUrl;
    }

    public String getImage_public_id() {
        return image_public_id;
    }

    public String getImagePublicId() {
        return image_public_id;
    }

    public void setImagePublicId(String imagePublicId) {
        this.image_public_id = imagePublicId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}