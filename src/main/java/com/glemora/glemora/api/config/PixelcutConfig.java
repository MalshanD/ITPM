package com.glemora.glemora.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "pixelcut")
@Data
public class PixelcutConfig {
    private String apiKey;
    private String apiBaseUrl = "https://api.developer.pixelcut.ai";
}




