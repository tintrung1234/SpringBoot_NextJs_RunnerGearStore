package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.CartItem;
import com.example.spring_postgres_blog.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            logger.info("Adding to cart - userId: {}, productId: {}, quantity: {}", userId, productId, quantity);

            cartService.addToCart(userId, productId, quantity);
            return ResponseEntity.ok().body(Map.of("message", "Product added to cart successfully"));
        } catch (Exception e) {
            logger.error("Error adding to cart", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getUserCart(@PathVariable Long userId) {
        List<CartItem> cartItems = cartService.getCartItemsByUserId(userId);
        return ResponseEntity.ok(cartItems);
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        try {
            cartService.removeFromCart(cartItemId);
            return ResponseEntity.ok().body(Map.of("message", "Item removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cartItemId}/quantity")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer quantity = request.get("quantity");
            cartService.updateQuantity(cartItemId, quantity);
            return ResponseEntity.ok().body(Map.of("message", "Quantity updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/count")
    public ResponseEntity<Integer> getCartCount(@PathVariable Long userId) {
        int count = cartService.getCartItemsByUserId(userId).size();
        return ResponseEntity.ok(count);
    }
}