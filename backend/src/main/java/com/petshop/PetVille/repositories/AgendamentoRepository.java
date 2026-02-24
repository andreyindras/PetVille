package com.petshop.PetVille.repositories;

import com.petshop.PetVille.domain.Agendamento;
import com.petshop.PetVille.domain.enums.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByPetId(Long petId);

    List<Agendamento> findByFuncionarioResponsavelId(Long funcionarioId);

    List<Agendamento> findByStatusAgendamento(StatusAgendamento status);

    List<Agendamento> findByDataHoraInicioBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.funcionarioResponsavel.id = :funcionarioId
          AND a.statusAgendamento NOT IN :statusIgnorados
          AND (
              :inicio < a.dataHoraFim
              AND
              :fim   > a.dataHoraInicio
          )
    """)
    List<Agendamento> verificarConflito(
            @Param("funcionarioId") Long funcionarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("statusIgnorados") List<StatusAgendamento> statusIgnorados
    );
}
