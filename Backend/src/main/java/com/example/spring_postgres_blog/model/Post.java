package com.example.spring_postgres_blog.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;
    private String title;
    private String description;
    private String category;
    private Integer views = 0;

    @Column(columnDefinition = "TEXT")
    private String content;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostView> viewsPerDay = new ArrayList<>();

    private String image_url;
    private LocalDateTime created_at = LocalDateTime.now();
    private String slug;
    private String image_public_id;

    // SEO fields
    private String meta_title;
    private String meta_description;
    private String meta_keywords;
    private String meta_url;

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public List<PostView> getViewsPerDay() {
        return viewsPerDay;
    }

    public void setViewsPerDay(List<PostView> viewsPerDay) {
        this.viewsPerDay = viewsPerDay;
        for (PostView view : viewsPerDay) {
            view.setPost(this);
        }
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return image_url;
    }

    public void setImageUrl(String imageUrl) {
        this.image_url = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.created_at = createdAt;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getImagePublicId() {
        return image_public_id;
    }

    public void setImagePublicId(String imagePublicId) {
        this.image_public_id = imagePublicId;
    }

    public String getMetaTitle() {
        return meta_title;
    }

    public void setMetaTitle(String metaTitle) {
        this.meta_title = metaTitle;
    }

    public String getMetaDescription() {
        return meta_description;
    }

    public void setMetaDescription(String metaDescription) {
        this.meta_description = metaDescription;
    }

    public String getMetaKeywords() {
        return meta_keywords;
    }

    public void setMetaKeywords(String metaKeywords) {
        this.meta_keywords = metaKeywords;
    }

    public String getMetaURL() {
        return meta_url;
    }

    public void setMetaURL(String metaURL) {
        this.meta_url = metaURL;
    }
}
