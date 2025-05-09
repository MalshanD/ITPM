package com.glemora.glemora.api.service.Impl;

import com.cloudinary.Cloudinary;
import com.glemora.glemora.api.config.PixelcutConfig;
import com.glemora.glemora.api.controller.response.TryOnResponse;
import com.glemora.glemora.api.repository.VirtualTryOnImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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

    private static final int MAX_IMAGE_DIMENSION = 5900;

    public TryOnResponse tryOnGarment(String personImageUrl, String garmentImageUrl) {
        String url = properties.getApiBaseUrl() + "/v1/try-on";

        log.info("Making try-on API call with person image: {} and garment image: {}", personImageUrl, garmentImageUrl);

        try {
            personImageUrl = checkAndResizeRemoteImageIfNeeded(personImageUrl);
            garmentImageUrl = checkAndResizeRemoteImageIfNeeded(garmentImageUrl);

            log.info("After resizing check: person image: {}, garment image: {}", personImageUrl, garmentImageUrl);
        } catch (IOException e) {
            log.error("Error resizing remote images: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process images for try-on", e);
        }

        // Create headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("X-API-KEY", properties.getApiKey());

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("person_image_url", personImageUrl);
        requestBody.put("garment_image_url", garmentImageUrl);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);

            log.info("Response status: {}", responseEntity.getStatusCode());
            log.info("Response body: {}", responseEntity.getBody());

            if (responseEntity.getBody() != null && responseEntity.getBody().containsKey("result_url")) {
                TryOnResponse response = new TryOnResponse();
                response.setResultUrl((String) responseEntity.getBody().get("result_url"));
                log.info("Extracted result URL: {}", response.getResultUrl());
                return response;
            } else {
                log.warn("Response body doesn't contain result_url field: {}", responseEntity.getBody());
                TryOnResponse errorResponse = new TryOnResponse();
                errorResponse.setResultUrl("No result URL provided in API response");
                return errorResponse;
            }
        } catch (Exception e) {
            log.error("Error calling try-on API: {}", e.getMessage(), e);
            throw e;
        }
    }
}
