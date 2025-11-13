package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.dto.*;
import com.example.spring_postgres_blog.model.User;
import com.example.spring_postgres_blog.service.UserService;
import com.example.spring_postgres_blog.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setEmail(request.getEmail());
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());

            User savedUser = userService.register(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new MessageResponse("Đăng ký thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new MessageResponse("Đăng ký thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userService.login(request.getEmail(), request.getPassword());

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        new MessageResponse("Email hoặc mật khẩu không đúng!"));
            }

            User user = userOpt.get();

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId(),
                    user.getRole());

            // Convert to DTO (không trả password)
            UserDTO userDTO = userService.convertToDTO(user);

            // Return token and user info
            return ResponseEntity.ok(new AuthResponse(token, userDTO));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new MessageResponse("Đăng nhập thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUser();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updateData) {
        return userService.updateUser(id, updateData).orElseThrow();
    }

    @DeleteMapping("/id")
    public void delete(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PutMapping("/{userId}/toggle-post")
    public ResponseEntity<?> toggleFavoritePost(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        try {
            String postId = body.get("postId");
            System.out.println("postId received: " + postId);
            if (postId == null || postId.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new MessageResponse("Post ID is required"));
            }

            User updated = userService.toggleFavoritePost(userId, postId);
            UserDTO userDTO = userService.convertToDTO(updated);
            System.out.println("response entity: " + userDTO);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new MessageResponse("Error toggling favorite: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/toggle-product")
    public ResponseEntity<?> toggleFavoriteProduct(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        try {
            String productId = body.get("productId");
            if (productId == null || productId.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new MessageResponse("Product ID is required"));
            }

            User updated = userService.toggleFavoriteProduct(userId, productId);
            UserDTO userDTO = userService.convertToDTO(updated);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new MessageResponse("Error toggling favorite: " + e.getMessage()));
        }
    }
}

// Helper class for simple messages
class MessageResponse {
    private String message;

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
