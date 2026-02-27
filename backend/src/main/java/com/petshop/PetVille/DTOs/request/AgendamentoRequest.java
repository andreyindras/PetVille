package com.petshop.PetVille.DTOs.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AgendamentoRequest(

        @NotNull(message = "Pet é obrigatório")
        Long petId,

        @NotNull(message = "Serviço é obrigatório")
        Long servicoId,

        Long funcionarioId,

        @NotNull(message = "Data e hora são obrigatórias")
        @Future(message = "A data/hora deve ser no futuro")
        LocalDateTime dataHoraInicio,

        String observacoes
) {}