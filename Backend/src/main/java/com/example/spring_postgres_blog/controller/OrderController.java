package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.CheckoutRequest;
import com.example.spring_postgres_blog.model.Order;
import com.example.spring_postgres_blog.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.spring_postgres_blog.model.CheckoutRequest;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout/{userId}")
    public ResponseEntity<Order> checkout(
            @PathVariable Long userId,
            @RequestBody CheckoutRequest request) {
        System.out.println("check out");
        return ResponseEntity.ok(orderService.createOrderFromCart(
                userId,
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getShippingAddress()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }
}