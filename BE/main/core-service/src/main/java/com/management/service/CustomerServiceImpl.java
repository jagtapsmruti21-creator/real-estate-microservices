package com.management.service;

import com.management.entities.Customer;
import com.management.repository.CustomerRepository;
import com.management.custom_exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public Customer createCustomer(Customer customer) {
        // IMPORTANT:
        // Customer should already have 'user' set during registration (AuthController).
        // So here we do NOT create a customer without user.
        if (customer.getUser() == null) {
            throw new IllegalArgumentException("Customer must be linked to a User (user_id cannot be null).");
        }
        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Override
    public Customer updateCustomer(Long id, Customer updatedCustomer) {

        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found with id: " + id));

        // Update only customer profile fields
        existingCustomer.setCustName(updatedCustomer.getCustName());
        existingCustomer.setPhoneNo(updatedCustomer.getPhoneNo());
        existingCustomer.setGender(updatedCustomer.getGender());
        existingCustomer.setDob(updatedCustomer.getDob());

        // DO NOT update user link here (security reason)
        // DO NOT update bookings/payments/feedbacks/referrals here

        return customerRepository.save(existingCustomer);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found with id: " + id));

        customerRepository.delete(customer);
    }
}
