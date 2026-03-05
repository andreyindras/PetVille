package com.petshop.PetVille.controllers;

import com.petshop.PetVille.domain.Servico;
import com.petshop.PetVille.domain.enums.TipoServico;
import com.petshop.PetVille.DTOs.request.ServicoRequest;
import com.petshop.PetVille.DTOs.response.ServicoResponse;
import com.petshop.PetVille.services.ServicoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @PostMapping
    public ResponseEntity<ServicoResponse> criar(@RequestBody @Valid ServicoRequest request) {
        Servico servico = Servico.builder()
                .nome(request.nome())
                .tipo(request.tipo())
                .nomePersonalizado(request.nomePersonalizado())
                .descricao(request.descricao())
                .preco(request.preco())
                .duracaoMinutos(request.duracaoMinutos())
                .build();

        Servico criado = servicoService.criarServico(servico);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.getId())
                .toUri();

        return ResponseEntity.created(location).body(ServicoResponse.from(criado));
    }

    @GetMapping
    public ResponseEntity<List<ServicoResponse>> listarTodos() {
        List<ServicoResponse> servicos = servicoService.listarTodosServicos()
                .stream()
                .map(ServicoResponse::from)
                .toList();
        return ResponseEntity.ok(servicos);
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ServicoResponse>> listarAtivos() {
        List<ServicoResponse> servicos = servicoService.listarServicosAtivos()
                .stream()
                .map(ServicoResponse::from)
                .toList();
        return ResponseEntity.ok(servicos);
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<ServicoResponse>> listarPorTipo(@PathVariable TipoServico tipo) {
        List<ServicoResponse> servicos = servicoService.listarServicosPorTipo(tipo)
                .stream()
                .map(ServicoResponse::from)
                .toList();
        return ResponseEntity.ok(servicos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ServicoResponse.from(servicoService.buscarServicoPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicoResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid ServicoRequest request) {

        Servico dadosAtualizados = Servico.builder()
                .nome(request.nome())
                .tipo(request.tipo())
                .nomePersonalizado(request.nomePersonalizado())
                .descricao(request.descricao())
                .preco(request.preco())
                .duracaoMinutos(request.duracaoMinutos())
                .build();

        return ResponseEntity.ok(ServicoResponse.from(servicoService.atualizarServico(id, dadosAtualizados)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        servicoService.deletarServico(id);
        return ResponseEntity.noContent().build();
    }
}