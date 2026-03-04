package com.petshop.PetVille.controllers;

import com.petshop.PetVille.domain.Pet;
import com.petshop.PetVille.DTOs.request.PetRequest;
import com.petshop.PetVille.DTOs.response.PetResponse;
import com.petshop.PetVille.services.PetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @PostMapping("/clientes/{clienteId}")
    public ResponseEntity<PetResponse> cadastrar(
            @PathVariable Long clienteId,
            @RequestBody @Valid PetRequest request) {

        Pet pet = Pet.builder()
                .nome(request.nome())
                .especie(request.especie())
                .raca(request.raca())
                .idade(request.idade())
                .observacoes(request.observacoes())
                .build();

        Pet criado = petService.cadastrarPet(clienteId, pet);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .replacePath("/pets/{id}")
                .buildAndExpand(criado.getId())
                .toUri();

        return ResponseEntity.created(location).body(PetResponse.from(criado));
    }

    @GetMapping
    public ResponseEntity<List<PetResponse>> listarTodos() {
        List<PetResponse> pets = petService.listarTodosPets()
                .stream()
                .map(PetResponse::from)
                .toList();
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(PetResponse.from(petService.buscarPetPorId(id)));
    }

    @GetMapping("/clientes/{clienteId}")
    public ResponseEntity<List<PetResponse>> listarPorCliente(@PathVariable Long clienteId) {
        List<PetResponse> pets = petService.listarPetsPorCliente(clienteId)
                .stream()
                .map(PetResponse::from)
                .toList();
        return ResponseEntity.ok(pets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid PetRequest request) {

        Pet dadosAtualizados = Pet.builder()
                .nome(request.nome())
                .especie(request.especie())
                .raca(request.raca())
                .idade(request.idade())
                .observacoes(request.observacoes())
                .build();

        return ResponseEntity.ok(PetResponse.from(petService.atualizarPet(id, dadosAtualizados)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        petService.deletarPet(id);
        return ResponseEntity.noContent().build();
    }
}