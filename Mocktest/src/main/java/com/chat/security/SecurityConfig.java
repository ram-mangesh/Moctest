package com.chat.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Allow preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Auth APIs
                .requestMatchers("/api/auth/**").permitAll()

                // AI draft creation
                .requestMatchers("/api/assign/draft").permitAll()

                // WebSocket handshake
                .requestMatchers("/ws/**").permitAll()

                // Twilio Webhooks — must be public (Twilio calls from cloud, no JWT)
                .requestMatchers("/api/twilio/**").permitAll()

                // Group exam
                .requestMatchers("/api/group-exam/**").hasAnyRole("USER", "ADMIN")

                // ---------------- USER APIs ----------------
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")

                // Task 2 — Roadmap PDF
                .requestMatchers("/api/user/roadmap/**").hasAnyRole("USER", "ADMIN")

                // Task 3 — Annotations
                .requestMatchers("/api/user/annotations/**").hasAnyRole("USER", "ADMIN")

                // Task 4 — Difficulty slider
                .requestMatchers("/api/user/difficulty/**").hasAnyRole("USER", "ADMIN")

                // Task 5 — Behavioral analytics
                .requestMatchers("/api/user/behavior/**").hasAnyRole("USER", "ADMIN")

                // Task 6 — Stress configuration
                .requestMatchers("/api/user/stress-config/**").hasAnyRole("USER", "ADMIN")

                .requestMatchers("/api/user/ai/**").hasAnyRole("USER", "ADMIN")

                
                // ---------------- ADMIN APIs ----------------

                // Admin annotations
                .requestMatchers("/api/admin/annotations/**").hasRole("ADMIN")

                // Admin difficulty analytics
                .requestMatchers("/api/admin/difficulty/**").hasRole("ADMIN")

                // AI Assign / Generate
                .requestMatchers("/api/assign/**").hasRole("ADMIN")

                // AI Review / Approve
                .requestMatchers("/api/review/**").hasRole("ADMIN")

                // Admin general APIs
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/students/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )

            // JWT Filter
            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}