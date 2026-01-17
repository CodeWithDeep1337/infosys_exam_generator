package com.skillforge.config;

import com.skillforge.security.CustomAccessDeniedHandler;
import com.skillforge.security.JwtAuthenticationEntryPoint;
import com.skillforge.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(
            JwtFilter jwtFilter,
            CustomAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtFilter = jwtFilter;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS and Disable CSRF for stateless JWT APIs
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // 2. Handle Authentication/Authorization exceptions
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )

                // 3. Set Session to Stateless (Standard for JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 4. Define Route Access Rules
                .authorizeHttpRequests(auth -> auth
                        // Allow all pre-flight OPTIONS requests (Fixes CORS issues)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ FIX: Auth routes (Login/Register)
                        // Permitting both with and without /api prefix to solve "Full authentication required" logs
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()


                        // ✅ Public Quiz routes
                        .requestMatchers("/quizzes/all", "/quizzes/public/**").permitAll()

                        // ✅ Student-specific routes
                        .requestMatchers("/quizzes/submit-attempt", "/quizzes/user-attempts/**")
                        .hasAuthority("STUDENT")

                        // ✅ Instructor/Admin routes
                        .requestMatchers("/quizzes/generate", "/quizzes/attempts", "/quizzes/topic/**")
                        .hasAnyAuthority("INSTRUCTOR", "ADMIN")

                        // ✅ Allow Students to Download Materials (PermitAll for direct browser access)
                        .requestMatchers("/materials/download/**").permitAll()

                        // ✅ Allow Students to View Course Content
                        .requestMatchers(HttpMethod.GET, "/courses/**", "/subjects/**", "/topics/**", "/materials/**")
                        .permitAll()

                        // ✅ Course Management (Write Access)
                        .requestMatchers("/courses/**", "/subjects/**", "/topics/**", "/materials/**")
                        .hasAnyAuthority("INSTRUCTOR", "ADMIN")

                        // Everything else requires a valid JWT
                        .anyRequest().authenticated()
                )

                // 5. Add the JWT filter before the standard login filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allows frontend ports (3000/3001) to talk to the backend on 8081
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}











