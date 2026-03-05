package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.enums.TipoUsuario;

public record LoginResponse(
        String token,
        Long usuarioId,
        String nome,
        String email,
        TipoUsuario tipoUsuario
) {}