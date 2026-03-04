package com.petshop.PetVille.controllers;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.DTOs.request.FuncionarioRequest;
import com.petshop.PetVille.DTOs.request.UsuarioUpdateRequest;
import com.petshop.PetVille.DTOs.response.FuncionarioResponse;
import com.petshop.PetVille.services.FuncionarioService;
import com.petshop.PetVille.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;
    private final UsuarioService usuarioService;

    public FuncionarioController(FuncionarioService funcionarioService, UsuarioService usuarioService) {
        this.funcionarioService = funcionarioService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<FuncionarioResponse> cadastrar(@RequestBody @Valid FuncionarioRequest request) {
        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(request.senha())
                .build();

        Usuario criado = funcionarioService.cadastrarFuncionario(usuario);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.getId())
                .toUri();

        return ResponseEntity.created(location).body(FuncionarioResponse.from(criado));
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioResponse>> listarTodos() {
        List<FuncionarioResponse> funcionarios = funcionarioService.listarFuncionarios()
                .stream()
                .map(FuncionarioResponse::from)
                .toList();
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(FuncionarioResponse.from(funcionarioService.buscarFuncionarioPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuncionarioResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioUpdateRequest request) {

        Usuario dadosAtualizados = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(request.senha())
                .build();

        return ResponseEntity.ok(
                FuncionarioResponse.from(usuarioService.atualizarDadosUsuario(id, dadosAtualizados))
        );
    }

    @PatchMapping("/{id}/promover")
    public ResponseEntity<FuncionarioResponse> promoverParaAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(FuncionarioResponse.from(funcionarioService.alterarUsuarioParaAdmin(id)));
    }

    @PatchMapping("/{id}/rebaixar")
    public ResponseEntity<FuncionarioResponse> rebaixarParaFuncionario(@PathVariable Long id) {
        return ResponseEntity.ok(FuncionarioResponse.from(funcionarioService.alterarUsuarioParaFuncionario(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        funcionarioService.deletarFuncionario(id);
        return ResponseEntity.noContent().build();
    }
}