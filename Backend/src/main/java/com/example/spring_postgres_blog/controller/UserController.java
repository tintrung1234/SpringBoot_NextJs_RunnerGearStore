package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.User;
import com.example.spring_postgres_blog.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private UserController(UserService userService) { this.userService = userService; }

    @PostMapping("/register")
    public User register(@RequestBody User user){
        return userService.register(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        var userOpt = userService.login(email, password);
        Map<String, Object> respone = new HashMap<>();
        if (userOpt.isPresent()) {
            respone.put("message", "Login successful");
            respone.put("user", userOpt.get());
        } else {
            respone.put("message", "Invalid credentials");
        }
        return respone;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUser();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updateData){
        return userService.updateUser(id, updateData).orElseThrow();
    }

    @DeleteMapping("/id")
    public void delete(@PathVariable Long id){
        userService.deleteUser(id);
    }

    @PutMapping("{userId}/toggle-post")
    public ResponseEntity<User> toggleFavoritePost(@PathVariable Long userId, @RequestBody Map<String, String> body){
        String postId = body.get("postId");
        User updated = userService.toggleFavoritePost(userId, postId);
        return ResponseEntity.ok(updated);
    }
}
