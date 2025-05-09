package com.glemora.glemora.api.service.Impl;

import com.cloudinary.Cloudinary;
import com.glemora.glemora.api.config.PixelcutConfig;
import com.glemora.glemora.api.repository.VirtualTryOnImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class VirtualTryOnServiceImpl {

    private final PixelcutConfig properties;
    private final RestTemplate restTemplate;
    private final Cloudinary cloudinary;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VirtualTryOnImageRepository virtualTryOnImageRepository;

}
