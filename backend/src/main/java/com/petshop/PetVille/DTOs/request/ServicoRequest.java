package com.petshop.PetVille.DTOs.request;

import com.petshop.PetVille.domain.enums.TipoServico;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ServicoRequest(

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotNull(message = "Tipo do serviço é obrigatório")
        TipoServico tipo,

        String nomePersonalizado,
        String descricao,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.00", message = "Preço deve ser maior que zero")
        BigDecimal preco,

        @NotNull(message = "Duração é obrigatória")
        @Min(value = 1, message = "Duração deve ser maior que zero")
        Integer duracaoMinutos
) {}