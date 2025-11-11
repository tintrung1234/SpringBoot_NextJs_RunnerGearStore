package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.CartItem;
import com.example.spring_postgres_blog.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

interface AddToCartRequest {
    Long getUserId();

    Long getProductId();

    Integer getQuantity();
}

interface UpdateQuantityRequest {
    Integer getQuantity();
}

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
    public ResponseEntity<String> addToCart(@RequestBody AddToCartRequest req) {
        cartService.addToCart(req.getUserId(), req.getProductId(), req.getQuantity());
        return ResponseEntity.ok("Added to cart");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getUserCart(@PathVariable Long userId) {
        List<CartItem> cartItems = cartService.getCartItemsByUserId(userId);
        return ResponseEntity.ok(cartItems);
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok("Item removed from cart");
    }

    @PutMapping("/{cartItemId}/quantity")
    public ResponseEntity<String> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody UpdateQuantityRequest req) {

        logger.info("Received request to update quantity: " + req.getQuantity());
        if (req.getQuantity() == null || req.getQuantity() < 1) {
            return ResponseEntity.badRequest().body("Invalid quantity");
        }

        cartService.updateQuantity(cartItemId, req.getQuantity());
        return ResponseEntity.ok("Quantity updated");
    }

}
