package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.controller.CartController;
import com.example.spring_postgres_blog.model.*;
import com.example.spring_postgres_blog.repository.*;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

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
        User user = userRepo.findById(userId).orElseThrow();
        Product product = productRepo.findById(productId).orElseThrow();

        CartItem item = new CartItem();
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(quantity);

        cartRepo.save(item);
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
