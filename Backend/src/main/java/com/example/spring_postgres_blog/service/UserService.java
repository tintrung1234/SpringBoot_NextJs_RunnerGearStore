package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.User;
import com.example.spring_postgres_blog.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User register (User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> login(String email, String password){
        Optional<User> userOpt = userRepository.findByEmail(email);
        if(userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())){
            return userOpt;
        }
        return Optional.empty();
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

    public User toggleFavoritePost(Long userId, String postId) {
        User user = userRepository.findById(userId).orElseThrow();

        List<String> posts = new ArrayList<>(List.of(user.getFavoritesPost()));

        if(posts.contains(postId)){
            posts.remove(postId);
        } else {
            posts.add(postId);
        }

        user.setFavoritesPost(posts.toArray(new String[0]));
        return userRepository.save(user);
    }
}
