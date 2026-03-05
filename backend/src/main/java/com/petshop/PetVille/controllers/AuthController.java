package com.petshop.PetVille.controllers;

import com.petshop.PetVille.DTOs.request.LoginRequest;
import com.petshop.PetVille.DTOs.response.LoginResponse;
import com.petshop.PetVille.config.JwtService;
import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new RegraNegocioException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new RegraNegocioException("Email ou senha inválidos");
        }

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        usuario.getEmail(),
                        usuario.getSenha(),
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                "ROLE_" + usuario.getTipoUsuario().name()))
                );

        String token = jwtService.gerarToken(userDetails, Map.of(
                "usuarioId", usuario.getId(),
                "tipoUsuario", usuario.getTipoUsuario().name()
        ));

        return ResponseEntity.ok(new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario()
        ));
    }
}