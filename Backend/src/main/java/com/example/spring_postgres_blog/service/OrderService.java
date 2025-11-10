package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.*;
import com.example.spring_postgres_blog.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public Order createOrderFromCart(Long userId) {
        List<CartItem> items = cartRepo.findByUserId(userId);
        double total = items.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        Order order = new Order();
        User u = items.get(0).getUser();
        order.setUser(u);
        order.setTotalAmount(total);
        order.setStatus("PENDING");

        Order saved = orderRepo.save(order);

        cartRepo.deleteAll(items); // clear cart
        return saved;
    }
}
