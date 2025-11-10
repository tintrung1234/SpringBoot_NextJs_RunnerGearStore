package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.*;
import com.example.spring_postgres_blog.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
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
}
