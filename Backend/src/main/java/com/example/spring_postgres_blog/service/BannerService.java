package com.example.spring_postgres_blog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.spring_postgres_blog.model.Banner;
import com.example.spring_postgres_blog.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private Cloudinary cloudinary;

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Banner::getCreatedAt).reversed())
                .toList();
    }

    public Banner createBanner(MultipartFile file) throws Exception {
        String imageUrl = "";
        String imagePublicId = "";

        if (file != null && !file.isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "banners"));
            imageUrl = uploadResult.get(uploadResult.get("secure_url")).toString();
            imagePublicId = uploadResult.get("public_id").toString();
        }

        Banner banner = new Banner(imageUrl, imagePublicId);
        return bannerRepository.save(banner);
    }

    public boolean deleteBanner(Long id) {
        Optional<Banner> banner = bannerRepository.findById(id);
        if (banner.isEmpty())
            return false;

        bannerRepository.deleteById(id);
        return true;
    }
}
