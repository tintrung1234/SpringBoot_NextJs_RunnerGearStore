package com.example.spring_postgres_blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url")
    private String image_url;

    @Column(name = "image_public_id")
    private String image_public_id;

    @Column(name = "created_at")
    private LocalDateTime created_at;

    public Banner() {
        this.created_at = LocalDateTime.now();
    }

    public Banner(String image_url, String image_public_id) {
        this.image_url = image_url;
        this.image_public_id = image_public_id;
        this.created_at = LocalDateTime.now();
    }

    // Getters và Setters
    public Long getId() {
        return id;
    }

    public String getimage_url() {
        return image_url;
    }

    public void setimage_url(String image_url) {
        this.image_url = image_url;
    }

    public String getimage_public_id() {
        return image_public_id;
    }

    public void setimage_public_id(String image_public_id) {
        this.image_public_id = image_public_id;
    }

    public LocalDateTime getcreated_at() {
        return created_at;
    }

    public void setcreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}
