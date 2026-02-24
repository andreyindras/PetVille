package com.petshop.PetVille.domain;

import com.petshop.PetVille.domain.enums.StatusAgendamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(nullable = false)
    private LocalDateTime horarioAgendamento;

    private StatusAgendamento statusAgendamento = StatusAgendamento.PENDENTE;

    @ManyToOne
    @JoinColumn(name = "funcionario_id")
    private Usuario funcionarioResponsavel;

    private String observacoes;
}
