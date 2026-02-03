package com.management.logging;

public class LogRequest {
    private String source;
    private String level;     // INFO/WARN/ERROR
    private String message;
    private String customerId;
    private String traceId;

    public LogRequest() {}

    public LogRequest(String source, String level, String message, String customerId, String traceId) {
        this.source = source;
        this.level = level;
        this.message = message;
        this.customerId = customerId;
        this.traceId = traceId;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }
}
