package com.example.spring_postgres_blog.service;

import com.example.spring_postgres_blog.model.Information;
import com.example.spring_postgres_blog.repository.InformationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InformationService {

    @Autowired
    private InformationRepository informationRepository;

    public List<Information> getAllInformation() {
        return informationRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    public Information createInformation(Information info) {
        return informationRepository.save(info);
    }

    public Information updateInformation(Long id, Information updated) {
        return informationRepository.findById(id)
                .map(info -> {
                    info.setEmail(updated.getEmail());
                    info.setPhoneNumber(updated.getPhoneNumber());
                    return informationRepository.save(info);
                })
                .orElseThrow(() -> new RuntimeException("Information not found"));
    }

    public void deleteInformation(Long id) {
        if (!informationRepository.existsById(id)) {
            throw new RuntimeException("Information not found");
        }
        informationRepository.deleteById(id);
    }
}
