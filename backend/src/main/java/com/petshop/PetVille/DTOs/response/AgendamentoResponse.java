package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.Agendamento;
import com.petshop.PetVille.domain.enums.StatusAgendamento;

import java.time.LocalDateTime;

public record AgendamentoResponse(Long id, Long petId, String nomePet, Long servicoId, String nomeServico, Long funcionarioId, String nomeFuncionario, LocalDateTime dataHoraInicio, LocalDateTime dataHoraFim, StatusAgendamento status, String observacoes) {
    public static AgendamentoResponse from(Agendamento agendamento) {
        return new AgendamentoResponse(
                agendamento.getId(),
                agendamento.getPet().getId(),
                agendamento.getPet().getNome(),
                agendamento.getServico().getId(),
                agendamento.getServico().getNome(),
                agendamento.getFuncionarioResponsavel() != null
                        ? agendamento.getFuncionarioResponsavel().getId() : null,
                agendamento.getFuncionarioResponsavel() != null
                        ? agendamento.getFuncionarioResponsavel().getNome() : null,
                agendamento.getDataHoraInicio(),
                agendamento.getDataHoraFim(),
                agendamento.getStatusAgendamento(),
                agendamento.getObservacoes()
        );
    }
}