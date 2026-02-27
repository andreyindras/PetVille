package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.Servico;
import com.petshop.PetVille.domain.enums.TipoServico;

import java.math.BigDecimal;

public record ServicoResponse(Long id, String nome, TipoServico tipo, String nomePersonalizado, String descricao, BigDecimal preco, Integer duracaoMinutos, Boolean ativo) {
    public static ServicoResponse from(Servico servico) {
        return new ServicoResponse(
                servico.getId(),
                servico.getNome(),
                servico.getTipo(),
                servico.getNomePersonalizado(),
                servico.getDescricao(),
                servico.getPreco(),
                servico.getDuracaoMinutos(),
                servico.getAtivo()
        );
    }
}