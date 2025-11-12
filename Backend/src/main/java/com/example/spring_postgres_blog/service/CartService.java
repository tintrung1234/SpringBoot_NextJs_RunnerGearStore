package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.controller.CartController;
import com.example.spring_postgres_blog.model.*;
import com.example.spring_postgres_blog.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CartService {
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public CartService(CartRepository cartRepo, ProductRepository productRepo, UserRepository userRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void addToCart(Long userId, Long productId, int quantity) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartRepo.findByUserIdAndProductId(userId, productId);

        if (existingItem.isPresent()) {
            // Update quantity if item already exists
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartRepo.save(item);
            logger.info("Updated existing cart item quantity");
        } else {
            // Create new cart item
            CartItem item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(quantity);
            cartRepo.save(item);
            logger.info("Created new cart item");
        }
    }

    public List<CartItem> getCartItemsByUserId(Long userId) {
        return cartRepo.findByUserId(userId);
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartRepo.deleteById(cartItemId);
    }

    @Transactional
    public void updateQuantity(Long cartItemId, Integer quantity) {
        logger.info("Updating cart item " + cartItemId + " to quantity " + quantity);
        CartItem cartItem = cartRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartItem.setQuantity(quantity);
        cartRepo.save(cartItem);
    }
}