package com.petshop.PetVille.services;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.TipoUsuario;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuncionarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public FuncionarioService(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public Usuario cadastrarFuncionario(Usuario usuario) {
        usuario.setTipoUsuario(TipoUsuario.FUNCIONARIO);
        return usuarioService.criarUsuario(usuario);
    }

    public List<Usuario> listarFuncionarios() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getTipoUsuario() == TipoUsuario.FUNCIONARIO
                        || u.getTipoUsuario() == TipoUsuario.ADMIN)
                .toList();
    }

    public Usuario buscarFuncionarioPorId(Long id) {
        Usuario usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario.getTipoUsuario() == TipoUsuario.CLIENTE) {
            throw new RegraNegocioException("Usuário informado não é um funcionário");
        }
        return usuario;
    }

    @Transactional
    public Usuario alterarUsuarioParaAdmin(Long funcionarioId) {
        Usuario funcionario = buscarFuncionarioPorId(funcionarioId);
        funcionario.setTipoUsuario(TipoUsuario.ADMIN);
        return usuarioRepository.save(funcionario);
    }

    @Transactional
    public Usuario alterarUsuarioParaFuncionario(Long adminId) {
        Usuario admin = usuarioService.buscarUsuarioPorId(adminId);
        if (admin.getTipoUsuario() != TipoUsuario.ADMIN) {
            throw new RegraNegocioException("Usuário informado não é um administrador");
        }
        admin.setTipoUsuario(TipoUsuario.FUNCIONARIO);
        return usuarioRepository.save(admin);
    }

    @Transactional
    public void deletarFuncionario(Long id) {
        Usuario funcionario = buscarFuncionarioPorId(id);
        usuarioRepository.delete(funcionario);
    }
}