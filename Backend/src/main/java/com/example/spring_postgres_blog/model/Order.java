package com.example.spring_postgres_blog.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderItem> orderItems = new ArrayList<>();

    private String fullName;
    private String email;
    private String phone;
    private Double total_amount;
    private String status;
    private String shipping_address;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Helper method to add single item
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    // getters & setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        // Clear existing items
        this.orderItems.clear();

        // Add new items and set the order reference
        if (orderItems != null) {
            for (OrderItem item : orderItems) {
                this.addOrderItem(item);
            }
        }
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getShippingAddress() {
        return shipping_address;
    }

    public void setShippingAddress(String shipping_address) {
        this.shipping_address = shipping_address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getTotalAmount() {
        return total_amount;
    }

    public void setTotalAmount(Double total_amount) {
        this.total_amount = total_amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}