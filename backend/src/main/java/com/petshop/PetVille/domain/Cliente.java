package com.petshop.PetVille.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private String endereco;
    private String telefone;
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;
    private LocalDateTime dataCadastro;
    private Boolean ativo = true;

    @OneToMany(mappedBy = "cliente")
    private List<Pet> pets = new ArrayList<>();
}
