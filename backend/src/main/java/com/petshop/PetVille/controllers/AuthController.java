package com.petshop.PetVille.controllers;

import com.petshop.PetVille.DTOs.request.LoginRequest;
import com.petshop.PetVille.DTOs.response.LoginResponse;
import com.petshop.PetVille.config.JwtService;
import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.TipoUsuario;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.ClienteRepository;
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
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository,
                          ClienteRepository clienteRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
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

        Long clienteId = null;
        if (usuario.getTipoUsuario() == TipoUsuario.CLIENTE) {
            clienteId = clienteRepository.findByUsuarioId(usuario.getId())
                    .map(c -> c.getId())
                    .orElse(null);
        }

        Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("usuarioId", usuario.getId());
        claims.put("tipoUsuario", usuario.getTipoUsuario().name());
        if (clienteId != null) {
            claims.put("clienteId", clienteId);
        }

        String token = jwtService.gerarToken(userDetails, claims);

        return ResponseEntity.ok(new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario(),
                clienteId
        ));
    }
}