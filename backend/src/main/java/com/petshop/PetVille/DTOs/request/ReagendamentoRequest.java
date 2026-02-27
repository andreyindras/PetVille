package com.petshop.PetVille.DTOs.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReagendamentoRequest(

        @NotNull(message = "Nova data/hora é obrigatória")
        @Future(message = "A data/hora deve ser no futuro")
        LocalDateTime novaDataHoraInicio
) {}