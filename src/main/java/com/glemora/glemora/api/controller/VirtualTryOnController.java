package com.glemora.glemora.api.controller;

import com.glemora.glemora.api.controller.request.TryOnRequest;
import com.glemora.glemora.api.controller.response.TryOnResponse;
import com.glemora.glemora.api.service.Impl.VirtualTryOnServiceImpl;
import jakarta.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tryon")
@RequiredArgsConstructor
@Slf4j
public class VirtualTryOnController {

    private final VirtualTryOnServiceImpl virtualTryOnService;

    @PostMapping
    @RolesAllowed({"USER", "ADMIN"})
    public ResponseEntity<TryOnResponse> tryOnGarment(@RequestBody TryOnRequest request) {
        TryOnResponse response = virtualTryOnService.tryOnGarment(request.getPersonImageUrl(), request.getGarmentImageUrl());
        return ResponseEntity.ok(response);
    }
}
