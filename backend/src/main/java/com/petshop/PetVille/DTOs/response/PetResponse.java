package com.petshop.PetVille.DTOs.response;

import com.petshop.PetVille.domain.Pet;

public record PetResponse(Long id, Long clienteId, String nomeCliente, String nome, String especie, String raca, Integer idade, String observacoes) {
    public static PetResponse from(Pet pet) {
        return new PetResponse(
                pet.getId(),
                pet.getCliente().getId(),
                pet.getCliente().getUsuario().getNome(),
                pet.getNome(),
                pet.getEspecie(),
                pet.getRaca(),
                pet.getIdade(),
                pet.getObservacoes()
        );
    }
}