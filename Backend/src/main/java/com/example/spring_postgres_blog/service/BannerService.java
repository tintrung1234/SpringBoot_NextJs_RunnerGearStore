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
                .sorted(Comparator.comparing(Banner::getcreated_at).reversed())
                .toList();
    }

    public Banner createBanner(MultipartFile file) throws Exception {
        String image_url = "";
        String image_public_id = "";

        if (file != null && !file.isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "banners"));
            image_url = uploadResult.get(uploadResult.get("secure_url")).toString();
            image_public_id = uploadResult.get("public_id").toString();
        }

        Banner banner = new Banner(image_url, image_public_id);
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
