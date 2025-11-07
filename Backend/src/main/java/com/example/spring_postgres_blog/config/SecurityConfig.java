package com.example.spring_postgres_blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF khi test API
                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/users/register", "/api/users/login").permitAll() // Cho phép public
                        .anyRequest().permitAll()
                )
                .httpBasic(withDefaults()); // Dùng Basic Auth

        return http.build();
    }
}
