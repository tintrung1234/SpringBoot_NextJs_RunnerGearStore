package com.example.spring_postgres_blog.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "post_views")
public class PostView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date; // ngày cụ thể
    private Integer view_count;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getViewCount() {
        return view_count;
    }

    public void setViewCount(Integer view_count) {
        this.view_count = view_count;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }
}
