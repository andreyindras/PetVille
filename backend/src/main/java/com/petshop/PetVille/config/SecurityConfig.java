package com.petshop.PetVille.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/clientes").permitAll()

                        .requestMatchers(HttpMethod.POST,   "/api/funcionarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/funcionarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/funcionarios/*/promover").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/funcionarios/*/rebaixar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/servicos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/servicos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/servicos/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET,   "/api/agendamentos/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/confirmar").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/iniciar").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/concluir").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/funcionario/*").hasAnyRole("ADMIN", "FUNCIONARIO")

                        .requestMatchers(HttpMethod.POST,  "/api/agendamentos").hasAnyRole("ADMIN", "FUNCIONARIO", "CLIENTE")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/cancelar").hasAnyRole("ADMIN", "FUNCIONARIO", "CLIENTE")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/reagendar").hasAnyRole("ADMIN", "FUNCIONARIO", "CLIENTE")

                        .requestMatchers(HttpMethod.POST,   "/api/pets/**").hasAnyRole("ADMIN", "FUNCIONARIO", "CLIENTE")
                        .requestMatchers(HttpMethod.GET,    "/api/pets/**").hasAnyRole("ADMIN", "FUNCIONARIO", "CLIENTE")
                        .requestMatchers(HttpMethod.PUT,    "/api/pets/**").hasAnyRole("ADMIN", "CLIENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/pets/**").hasAnyRole("ADMIN", "CLIENTE")

                        .requestMatchers(HttpMethod.GET, "/api/servicos/**").hasAnyRole("ADMIN", "FUNCIONARIO", "CLIENTE")

                        .requestMatchers(HttpMethod.GET, "/api/funcionarios/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PUT, "/api/funcionarios/**").hasAnyRole("ADMIN", "FUNCIONARIO")

                        .requestMatchers(HttpMethod.GET,    "/api/clientes/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PUT,    "/api/clientes/**").hasAnyRole("ADMIN", "CLIENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/clientes/**").hasRole("ADMIN")

                        .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}