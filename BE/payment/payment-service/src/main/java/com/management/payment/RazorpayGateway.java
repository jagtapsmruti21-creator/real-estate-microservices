package com.management.payment;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayGateway {

    private final RazorpayClient client;
    private final String keyId;
    private final String keySecret;

    public RazorpayGateway(
            @Value("${razorpay.keyId}") String keyId,
            @Value("${razorpay.keySecret}") String keySecret
    ) throws Exception {
        this.client = new RazorpayClient(keyId, keySecret);
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    // Razorpay expects amount in paise
    public Order createOrder(double amount, String currency, String receipt) throws Exception {
        JSONObject options = new JSONObject();
        options.put("amount", Math.round(amount * 100)); // convert to paise
        options.put("currency", currency);
        options.put("receipt", receipt);

        return client.orders.create(options);
    }
}
