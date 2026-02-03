package com.management.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> {});
        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(auth -> auth
                // ✅ VERY IMPORTANT: allow preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/actuator/**").permitAll()

                // ADMIN APIs
                // ✅ Allow OWNER to read payments (GET only) so owners can see paid/remaining for their bookings
                .requestMatchers(HttpMethod.GET, "/api/admin/payments/**")
                .hasAnyAuthority("ROLE_ADMIN", "ADMIN", "ROLE_OWNER", "OWNER")

                .requestMatchers("/api/admin/**")
                .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                // CUSTOMER APIs (also allow ADMIN)
                .requestMatchers("/api/customer/**")
                .hasAnyAuthority("ROLE_CUSTOMER", "CUSTOMER", "ROLE_ADMIN", "ADMIN")

                .anyRequest().authenticated()
        );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
