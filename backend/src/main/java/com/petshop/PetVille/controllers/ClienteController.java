package com.petshop.PetVille.controllers;

import com.petshop.PetVille.domain.Cliente;
import com.petshop.PetVille.DTOs.request.ClienteRequest;
import com.petshop.PetVille.DTOs.request.ClienteUpdateRequest;
import com.petshop.PetVille.DTOs.response.ClienteResponse;
import com.petshop.PetVille.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> cadastrar(@RequestBody @Valid ClienteRequest request) {
        // Tudo em uma única transação: cria Usuario + Cliente juntos
        Cliente criado = clienteService.registrarNovoCliente(
                request.nome(),
                request.email(),
                request.senha(),
                request.cpf(),
                request.telefone(),
                request.endereco()
        );

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.getId())
                .toUri();

        return ResponseEntity.created(location).body(ClienteResponse.from(criado));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listarTodos() {
        return ResponseEntity.ok(
                clienteService.listarTodosClientes().stream()
                        .map(ClienteResponse::from)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ClienteResponse.from(clienteService.buscarClientePorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid ClienteUpdateRequest request) {
        Cliente atualizado = clienteService.atualizarCliente(id, request.endereco(), request.telefone());
        return ResponseEntity.ok(ClienteResponse.from(atualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        clienteService.deletarCliente(id);
        return ResponseEntity.noContent().build();
    }
}