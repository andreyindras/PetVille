package com.petshop.PetVille.DTOs.request;

import jakarta.validation.constraints.Pattern;

public record ClienteUpdateRequest(

        String endereco,

        @Pattern(regexp = "\\d{10,11}", message = "Telefone deve conter 10 ou 11 dígitos")
        String telefone
) {}