package com.petshop.PetVille.config;

import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.TipoUsuario;
import com.petshop.PetVille.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByEmail("admin@petville.com")) {
            Usuario admin = Usuario.builder()
                    .nome("Administrador")
                    .email("admin@petville.com")
                    .senha(passwordEncoder.encode("admin123"))
                    .tipoUsuario(TipoUsuario.ADMIN)
                    .dataCadastro(LocalDateTime.now())
                    .build();
            usuarioRepository.save(admin);
            System.out.println("Admin criado: admin@petville.com / admin123");
        }
    }
}