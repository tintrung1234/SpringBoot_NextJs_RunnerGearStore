package com.example.spring_postgres_blog.controller;

import com.example.spring_postgres_blog.model.Information;
import com.example.spring_postgres_blog.service.InformationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = { "${app.frontend.url}" })
@RestController
@RequestMapping("/api/information")
public class InformationController {

    @Autowired
    private InformationService informationService;

    @GetMapping
    public ResponseEntity<List<Information>> getAllInformation() {
        return ResponseEntity.ok(informationService.getAllInformation());
    }

    @PostMapping
    public ResponseEntity<Information> createInformation(@RequestBody Information info) {
        if (info.getEmail() == null || info.getEmail().isBlank()) {
            return ResponseEntity.badRequest().build(); // không có body
        }
        if (info.getPhoneNumber() == null || info.getPhoneNumber().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Information saved = informationService.createInformation(info);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Information> updateInformation(@PathVariable Long id, @RequestBody Information info) {
        try {
            Information updated = informationService.updateInformation(id, info);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Information> deleteInformation(@PathVariable Long id) {
        try {
            informationService.deleteInformation(id);
            return ResponseEntity.ok().build(); // HTTP 200, không trả body
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
