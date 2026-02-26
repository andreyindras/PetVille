package com.petshop.PetVille.services;

import com.petshop.PetVille.domain.Servico;
import com.petshop.PetVille.domain.enums.TipoServico;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.ServicoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @Transactional
    public Servico criarServico(Servico servico) {
        validarServico(servico);
        return servicoRepository.save(servico);
    }

    public Servico buscarServicoPorId(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Serviço não encontrado"));
    }

    public List<Servico> listarTodosServicos() {
        return servicoRepository.findAll();
    }

    public List<Servico> listarServicosAtivos() {
        return servicoRepository.findByAtivoTrue();
    }

    public List<Servico> listarServicosPorTipo(TipoServico tipo) {
        return servicoRepository.findByTipo(tipo);
    }

    @Transactional
    public Servico atualizarServico(Long id, Servico servicoAtualizado) {
        Servico servico = buscarServicoPorId(id);

        if (servicoAtualizado.getNome() != null && !servicoAtualizado.getNome().isBlank()) {
            servico.setNome(servicoAtualizado.getNome());
        }
        if (servicoAtualizado.getTipo() != null) {
            servico.setTipo(servicoAtualizado.getTipo());
        }
        if (servicoAtualizado.getDescricao() != null) {
            servico.setDescricao(servicoAtualizado.getDescricao());
        }
        if (servicoAtualizado.getNomePersonalizado() != null) {
            servico.setNomePersonalizado(servicoAtualizado.getNomePersonalizado());
        }
        if (servicoAtualizado.getPreco() != null) {
            if (servicoAtualizado.getPreco().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RegraNegocioException("O preço do serviço deve ser maior que zero");
            }
            servico.setPreco(servicoAtualizado.getPreco());
        }
        if (servicoAtualizado.getDuracaoMinutos() != null) {
            if (servicoAtualizado.getDuracaoMinutos() <= 0) {
                throw new RegraNegocioException("A duração do serviço deve ser maior que zero");
            }
            servico.setDuracaoMinutos(servicoAtualizado.getDuracaoMinutos());
        }

        return servicoRepository.save(servico);
    }

    @Transactional
    public void deletarServico(Long id) {
        Servico servico = buscarServicoPorId(id);
        servicoRepository.delete(servico);
    }

    private void validarServico(Servico servico) {
        if (servico.getNome() == null || servico.getNome().isBlank()) {
            throw new RegraNegocioException("O nome do serviço é obrigatório");
        }
        if (servico.getTipo() == null) {
            throw new RegraNegocioException("O tipo do serviço é obrigatório");
        }
        if (servico.getPreco() == null || servico.getPreco().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("O preço do serviço deve ser maior que zero");
        }
        if (servico.getDuracaoMinutos() == null || servico.getDuracaoMinutos() <= 0) {
            throw new RegraNegocioException("A duração do serviço deve ser maior que zero");
        }
    }
}