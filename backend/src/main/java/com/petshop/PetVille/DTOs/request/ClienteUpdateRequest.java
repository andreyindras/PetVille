package com.petshop.PetVille.DTOs.request;

import jakarta.validation.constraints.Pattern;

public record ClienteUpdateRequest(

        String endereco,

        @Pattern(regexp = "\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}", message = "Telefone inválido")
        String telefone
) {}