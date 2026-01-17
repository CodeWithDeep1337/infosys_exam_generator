package com.skillforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        // 🔓 Public endpoints
                        .requestMatchers("/auth/register", "/auth/login").permitAll()

                        // 🔓 Allow preflight CORS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🔐 Role-based access
                        .requestMatchers("/courses/**").hasAnyAuthority("INSTRUCTOR", "ADMIN")
                        .requestMatchers("/subjects/**").hasAnyAuthority("INSTRUCTOR", "ADMIN")
                        .requestMatchers("/topics/**").hasAnyAuthority("INSTRUCTOR", "ADMIN")
                        .requestMatchers("/student/**").hasAuthority("STUDENT")
                        .requestMatchers("/admin/**").hasAuthority("ADMIN")

                        // 🔐 Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
