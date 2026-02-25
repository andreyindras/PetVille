package com.petshop.PetVille.services;

import com.petshop.PetVille.domain.Cliente;
import com.petshop.PetVille.domain.Pet;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.PetRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final ClienteService clienteService;

    public PetService(PetRepository petRepository, ClienteService clienteService) {
        this.petRepository = petRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public Pet cadastrarPet(Long clienteId, Pet pet) {
        Cliente cliente = clienteService.buscarClientePorId(clienteId);

        if (pet.getNome() == null || pet.getNome().isBlank()) {
            throw new RegraNegocioException("O nome do pet é obrigatório");
        }

        pet.setCliente(cliente);
        return petRepository.save(pet);
    }

    public Pet buscarPetPorId(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Pet não encontrado"));
    }

    public List<Pet> listarPetsPorCliente(Long clienteId) {
        clienteService.buscarClientePorId(clienteId);
        return petRepository.findByClienteId(clienteId);
    }

    public List<Pet> listarTodosPets() {
        return petRepository.findAll();
    }

    @Transactional
    public Pet atualizarPet(Long id, Pet petAtualizado) {
        Pet pet = buscarPetPorId(id);

        if (petAtualizado.getNome() != null && !petAtualizado.getNome().isBlank()) {
            pet.setNome(petAtualizado.getNome());
        }
        if (petAtualizado.getEspecie() != null) {
            pet.setEspecie(petAtualizado.getEspecie());
        }
        if (petAtualizado.getRaca() != null) {
            pet.setRaca(petAtualizado.getRaca());
        }
        if (petAtualizado.getIdade() != null) {
            pet.setIdade(petAtualizado.getIdade());
        }
        if (petAtualizado.getObservacoes() != null) {
            pet.setObservacoes(petAtualizado.getObservacoes());
        }

        return petRepository.save(pet);
    }

    @Transactional
    public void deletarPet(Long id) {
        Pet pet = buscarPetPorId(id);
        petRepository.delete(pet);
    }
}