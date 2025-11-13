package com.example.spring_postgres_blog.dto;

import java.util.List;

public class UserDTO {
    private Long id;
    private String email;
    private String username;
    private String role;
    private List<String> favoritesPost;
    private List<String> favoritesProduct;

    // Constructors
    public UserDTO() {
    }

    public UserDTO(Long id, String email, String username, String role, List<String> favoritesPost,
            List<String> favoritesProduct) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.role = role;
        this.favoritesPost = favoritesPost;
        this.favoritesProduct = favoritesProduct;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getFavoritesPost() {
        return favoritesPost;
    }

    public void setFavoritesPost(List<String> favoritesPost) {
        this.favoritesPost = favoritesPost;
    }

    public List<String> getFavoritesProduct() {
        return favoritesProduct;
    }

    public void setFavoritesProduct(List<String> favoritesProduct) {
        this.favoritesProduct = favoritesProduct;
    }
}