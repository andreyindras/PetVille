package com.petshop.PetVille.services;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Usuario criarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RegraNegocioException("Email já cadastrado");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        if (usuario.getDataCadastro() == null) {
            usuario.setDataCadastro(LocalDateTime.now());
        }

        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarUsuarioPorEmail(String email) {
       return usuarioRepository.findByEmail(email);
    }

    public Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Usuário não encontrado"));
    }

    @Transactional
    public Usuario atualizarDadosUsuario(Long id, Usuario usuarioDadosAtualizados) {
        Usuario usuario = buscarUsuarioPorId(id);

        if (usuarioDadosAtualizados.getNome() != null &&
                !usuarioDadosAtualizados.getNome().isBlank()) {
            usuario.setNome(usuarioDadosAtualizados.getNome());
        }

        if (usuarioDadosAtualizados.getEmail() != null &&
                !usuarioDadosAtualizados.getEmail().equals(usuario.getEmail())) {

            if (usuarioRepository.existsByEmail(usuarioDadosAtualizados.getEmail())) {
                throw new RegraNegocioException("Email já está em uso");
            }

            usuario.setEmail(usuarioDadosAtualizados.getEmail());
        }

        if (usuarioDadosAtualizados.getSenha() != null &&
                !usuarioDadosAtualizados.getSenha().isBlank()) {

            usuario.setSenha(passwordEncoder.encode(usuarioDadosAtualizados.getSenha()));
        }

        return usuarioRepository.save(usuario);
    }
}
