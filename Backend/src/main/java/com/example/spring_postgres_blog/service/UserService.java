package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.dto.UserDTO;
import com.example.spring_postgres_blog.model.User;
import com.example.spring_postgres_blog.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("User"); // Set default role
        return userRepository.save(user);
    }

    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    // Convert User to UserDTO (không trả password)
    public UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getFavoritesPost(),
                user.getFavoritesProduct());
    }

    public List<User> getAllUser() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> updateUser(Long id, User updateDate) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(updateDate.getEmail());
            user.setUsername(updateDate.getUsername());
            return userRepository.save(user);
        });
    }

    @Transactional
    public User toggleFavoritePost(Long userId, String postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> favorites = user.getFavoritesPost();
        if (favorites == null) {
            favorites = new ArrayList<>();
        }
        System.out.println("Current favorites: " + favorites);
        if (favorites.contains(postId)) {
            favorites.remove(postId);
        } else {
            favorites.add(postId);
        }

        user.setFavoritesPost(favorites);
        return userRepository.save(user);
    }

    @Transactional
    public User toggleFavoriteProduct(Long userId, String productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> favorites = user.getFavoritesProduct();
        if (favorites == null) {
            favorites = new ArrayList<>();
        }

        if (favorites.contains(productId)) {
            favorites.remove(productId);
        } else {
            favorites.add(productId);
        }

        user.setFavoritesProduct(favorites);
        return userRepository.save(user);
    }
}