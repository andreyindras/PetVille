package com.petshop.PetVille.DTOs.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PetRequest(

        @NotBlank(message = "Nome do pet é obrigatório")
        String nome,

        String especie,
        String raca,

        @Min(value = 0, message = "Idade não pode ser negativa")
        Integer idade,

        String observacoes
) {}