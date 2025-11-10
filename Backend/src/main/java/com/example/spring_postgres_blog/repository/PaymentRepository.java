package com.example.spring_postgres_blog.repository;

import com.example.spring_postgres_blog.model.Payment;
import com.example.spring_postgres_blog.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrder(Order order);
}
