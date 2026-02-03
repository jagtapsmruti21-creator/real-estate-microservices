package com.management.logging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
public class ExternalLogClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${com.management.logging.service.url:http://localhost:5000}")
    private String loggingServiceUrl;

    public void info(String source, String message, Long customerId) {
        send(source, "INFO", message, customerId);
    }

    public void warn(String source, String message, Long customerId) {
        send(source, "WARN", message, customerId);
    }

    public void error(String source, String message, Long customerId) {
        send(source, "ERROR", message, customerId);
    }

    private void send(String source, String level, String message, Long customerId) {
        String traceId = UUID.randomUUID().toString();

        LogRequest req = new LogRequest(
                source,
                level,
                message,
                customerId == null ? null : String.valueOf(customerId),
                traceId
        );

        try {
            restTemplate.postForObject(loggingServiceUrl + "/api/logs", req, Object.class);
        } catch (RestClientException ex) {
            // Fallback so your main app never breaks if logger is down
            System.out.println("[LOGGER DOWN] " + level + " " + source + " - " + message);
        }
    }
}
