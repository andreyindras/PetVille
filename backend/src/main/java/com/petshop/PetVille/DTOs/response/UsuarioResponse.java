package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.TipoUsuario;

import java.time.LocalDateTime;

public record UsuarioResponse(Long id, String nome, String email, TipoUsuario tipoUsuario, LocalDateTime dataCadastro) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario(),
                usuario.getDataCadastro()
        );
    }
}