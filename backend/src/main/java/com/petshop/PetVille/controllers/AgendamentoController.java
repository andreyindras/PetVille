package com.petshop.PetVille.controllers;

import com.petshop.PetVille.domain.enums.StatusAgendamento;
import com.petshop.PetVille.DTOs.request.AgendamentoRequest;
import com.petshop.PetVille.DTOs.request.CancelamentoRequest;
import com.petshop.PetVille.DTOs.request.ReagendamentoRequest;
import com.petshop.PetVille.DTOs.response.AgendamentoResponse;
import com.petshop.PetVille.services.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criar(@RequestBody @Valid AgendamentoRequest request) {
        AgendamentoResponse criado = AgendamentoResponse.from(
                agendamentoService.criarAgendamento(
                        request.petId(),
                        request.servicoId(),
                        request.funcionarioId(),
                        request.dataHoraInicio(),
                        request.observacoes()
                )
        );

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.id())
                .toUri();

        return ResponseEntity.created(location).body(criado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(AgendamentoResponse.from(agendamentoService.buscarAgendamentoPorId(id)));
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> listarTodos() {
        List<AgendamentoResponse> agendamentos = agendamentoService.listarTodosAgendamentos()
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<AgendamentoResponse>> listarPorPet(@PathVariable Long petId) {
        List<AgendamentoResponse> agendamentos = agendamentoService.listarAgendamentosPorPet(petId)
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<AgendamentoResponse>> listarPorFuncionario(@PathVariable Long funcionarioId) {
        List<AgendamentoResponse> agendamentos = agendamentoService.listarAgendamentosPorFuncionario(funcionarioId)
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AgendamentoResponse>> listarPorStatus(@PathVariable StatusAgendamento status) {
        List<AgendamentoResponse> agendamentos = agendamentoService.listarAgendamentosPorStatus(status)
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/data")
    public ResponseEntity<List<AgendamentoResponse>> listarPorData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        List<AgendamentoResponse> agendamentos = agendamentoService.listarAgendamentosPorData(data)
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<AgendamentoResponse>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {

        List<AgendamentoResponse> agendamentos = agendamentoService.listarAgendamentosPorPeriodo(inicio, fim)
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
        return ResponseEntity.ok(agendamentos);
    }

    @PatchMapping("/{id}/funcionario/{funcionarioId}")
    public ResponseEntity<AgendamentoResponse> atribuirFuncionario(
            @PathVariable Long id,
            @PathVariable Long funcionarioId) {

        return ResponseEntity.ok(
                AgendamentoResponse.from(agendamentoService.atribuirFuncionario(id, funcionarioId))
        );
    }

    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<AgendamentoResponse> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(AgendamentoResponse.from(agendamentoService.confirmarAgendamento(id)));
    }

    @PatchMapping("/{id}/iniciar")
    public ResponseEntity<AgendamentoResponse> iniciar(@PathVariable Long id) {
        return ResponseEntity.ok(AgendamentoResponse.from(agendamentoService.iniciarAtendimento(id)));
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<AgendamentoResponse> concluir(@PathVariable Long id) {
        return ResponseEntity.ok(AgendamentoResponse.from(agendamentoService.concluirAgendamento(id)));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponse> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) CancelamentoRequest request) {

        String motivo = request != null ? request.motivo() : null;
        return ResponseEntity.ok(AgendamentoResponse.from(agendamentoService.cancelarAgendamento(id, motivo)));
    }

    @PatchMapping("/{id}/reagendar")
    public ResponseEntity<AgendamentoResponse> reagendar(
            @PathVariable Long id,
            @RequestBody @Valid ReagendamentoRequest request) {

        return ResponseEntity.ok(
                AgendamentoResponse.from(agendamentoService.reagendar(id, request.novaDataHoraInicio()))
        );
    }
}