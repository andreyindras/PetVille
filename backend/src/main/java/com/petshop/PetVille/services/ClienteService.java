package com.petshop.PetVille.services;

import com.petshop.PetVille.domain.Cliente;
import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.TipoUsuario;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.ClienteRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioService usuarioService;

    public ClienteService(ClienteRepository clienteRepository, UsuarioService usuarioService) {
        this.clienteRepository = clienteRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public Cliente cadastrarCliente(Long usuarioId, Cliente dadosCliente) {
        if (dadosCliente.getCpf() == null || dadosCliente.getCpf().trim().isEmpty()) {
            throw new RegraNegocioException("CPF é obrigatório");
        }
        if (clienteRepository.existsByCpf(dadosCliente.getCpf())) {
            throw new RegraNegocioException("CPF já cadastrado no sistema");
        }
        if (clienteRepository.existsByUsuarioId(usuarioId)) {
            throw new RegraNegocioException("Este usuário já possui um perfil de cliente cadastrado");
        }

        Usuario usuario = usuarioService.buscarUsuarioPorId(usuarioId);
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new RegraNegocioException("Somente usuários do tipo CLIENTE podem ter perfil de cliente");
        }

        Cliente cliente = Cliente.builder()
                .usuario(usuario)
                .cpf(dadosCliente.getCpf())
                .endereco(dadosCliente.getEndereco())
                .telefone(dadosCliente.getTelefone())
                .dataCadastro(LocalDateTime.now())
                .ativo(true)
                .build();

        return clienteRepository.save(cliente);
    }

    public Cliente buscarClientePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Cliente não encontrado"));
    }

    public Cliente buscarClientePorUsuarioId(Long usuarioId) {
        return clienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RegraNegocioException("Cliente não encontrado para este usuário"));
    }

    public List<Cliente> listarTodosClientes() {
        return clienteRepository.findAll();
    }

    @Transactional
    public Cliente atualizarCliente(Long id, String endereco, String telefone) {
        Cliente cliente = buscarClientePorId(id);

        if (endereco != null && !endereco.isBlank()) {
            cliente.setEndereco(endereco);
        }

        if (telefone != null && !telefone.isBlank()) {
            cliente.setTelefone(telefone);
        }

        return clienteRepository.save(cliente);
    }

    @Transactional
    public void deletarCliente(Long id) {
        Cliente cliente = buscarClientePorId(id);
        clienteRepository.delete(cliente);
    }
}