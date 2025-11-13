package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.CheckoutRequest;
import com.example.spring_postgres_blog.model.Order;
import com.example.spring_postgres_blog.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/checkout/{userId}")
    public ResponseEntity<Order> checkout(
            @PathVariable Long userId,
            @RequestBody CheckoutRequest request) {
        System.out.println("Creating order for user: " + userId);
        return ResponseEntity.ok(orderService.createOrderFromCart(
                userId,
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getShippingAddress()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().body("Order cancelled successfully");
    }
}