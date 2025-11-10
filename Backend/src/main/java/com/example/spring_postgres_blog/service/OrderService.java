package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.*;
import com.example.spring_postgres_blog.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepo;
    private final CartRepository cartRepo;

    public OrderService(OrderRepository orderRepo, CartRepository cartRepo) {
        this.orderRepo = orderRepo;
        this.cartRepo = cartRepo;
    }

    @Transactional
    public Order createOrderFromCart(Long userId, String fullName, String email, String phone, String shippingAddress) {
        System.out.println("=== DEBUG: Starting checkout ===");
        System.out.println("User ID: " + userId);
        System.out.println("Form data: " + fullName + ", " + email + ", " + phone + ", " + shippingAddress);

        List<CartItem> items = cartRepo.findByUserId(userId);
        System.out.println("Cart items found: " + items.size());

        if (items.isEmpty()) {
            System.err.println("ERROR: Cart is empty!");
            throw new RuntimeException("Cart is empty");
        }

        // Log cart items
        for (CartItem item : items) {
            System.out.println("Cart item: " + item.getProduct().getTitle() +
                    " x" + item.getQuantity() +
                    " = $" + (item.getProduct().getPrice() * item.getQuantity()));
        }

        // Calculate total
        double total = items.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();
        System.out.println("Total calculated: $" + total);

        try {
            // Create Order
            Order order = new Order();
            User user = items.get(0).getUser();
            order.setUser(user);
            order.setFullName(fullName);
            order.setEmail(email);
            order.setPhone(phone);
            order.setShippingAddress(shippingAddress);
            order.setTotalAmount(total);
            order.setStatus("PENDING");
            System.out.println("Order entity created");

            // Create OrderItems from CartItems (DON'T set order yet)
            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItem cartItem : items) {
                OrderItem orderItem = new OrderItem();
                // Don't set order here - let setOrderItems handle it
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getProduct().getPrice());
                orderItems.add(orderItem);
                System.out.println("Created OrderItem for: " + cartItem.getProduct().getTitle());
            }

            // Use the helper method which maintains bidirectional relationship
            System.out.println("Setting " + orderItems.size() + " order items to order");
            order.setOrderItems(orderItems);

            System.out.println("Attempting to save order...");
            Order saved = orderRepo.save(order);
            System.out.println("✓ Order saved successfully with ID: " + saved.getId());
            System.out.println("✓ Order has " + saved.getOrderItems().size() + " items");

            // Clear cart
            System.out.println("Clearing cart...");
            cartRepo.deleteAll(items);
            System.out.println("✓ Cart cleared");

            System.out.println("=== Checkout completed successfully ===");
            return saved;

        } catch (Exception e) {
            System.err.println("❌ ERROR during checkout: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }

    public List<Order> getOrdersByUserId(Long userId) {
        System.out.println("Fetching orders for user: " + userId);
        List<Order> orders = orderRepo.findByUserId(userId);
        System.out.println("Found " + orders.size() + " orders");
        return orders;
    }
}