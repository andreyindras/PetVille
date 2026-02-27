package com.petshop.PetVille.controllers;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.DTOs.request.UsuarioRequest;
import com.petshop.PetVille.DTOs.request.UsuarioUpdateRequest;
import com.petshop.PetVille.DTOs.response.UsuarioResponse;
import com.petshop.PetVille.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@RequestBody @Valid UsuarioRequest request) {
        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(request.senha())
                .tipoUsuario(request.tipoUsuario())
                .build();

        Usuario criado = usuarioService.criarUsuario(usuario);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.getId())
                .toUri();

        return ResponseEntity.created(location).body(UsuarioResponse.from(criado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(UsuarioResponse.from(usuarioService.buscarUsuarioPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioUpdateRequest request) {

        Usuario dadosAtualizados = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(request.senha())
                .build();

        return ResponseEntity.ok(
                UsuarioResponse.from(usuarioService.atualizarDadosUsuario(id, dadosAtualizados))
        );
    }
}