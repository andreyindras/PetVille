package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.Cliente;

import java.time.LocalDateTime;

public record ClienteResponse(Long id, String nome, String email, String cpf, String endereco, String telefone, Boolean ativo, LocalDateTime dataCadastro) {
    public static ClienteResponse from(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getUsuario().getNome(),
                cliente.getUsuario().getEmail(),
                cliente.getCpf(),
                cliente.getEndereco(),
                cliente.getTelefone(),
                cliente.getAtivo(),
                cliente.getDataCadastro()
        );
    }
}