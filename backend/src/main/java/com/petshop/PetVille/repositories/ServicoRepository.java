package com.petshop.PetVille.repositories;

import com.petshop.PetVille.domain.Servico;
import com.petshop.PetVille.domain.enums.TipoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {
    List<Servico> findByTipo(TipoServico tipo);
    List<Servico> findByAtivoTrue();
}
