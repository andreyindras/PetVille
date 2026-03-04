package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.TipoUsuario;

import java.time.LocalDateTime;

public record FuncionarioResponse(
        Long id,
        String nome,
        String email,
        TipoUsuario cargo,
        LocalDateTime dataCadastro
) {
    public static FuncionarioResponse from(Usuario usuario) {
        return new FuncionarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario(),
                usuario.getDataCadastro()
        );
    }
}