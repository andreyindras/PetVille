package com.petshop.PetVille.services;

import com.petshop.PetVille.domain.Agendamento;
import com.petshop.PetVille.domain.Pet;
import com.petshop.PetVille.domain.Servico;
import com.petshop.PetVille.domain.Usuario;
import com.petshop.PetVille.domain.enums.StatusAgendamento;
import com.petshop.PetVille.domain.enums.TipoUsuario;
import com.petshop.PetVille.exception.RegraNegocioException;
import com.petshop.PetVille.repositories.AgendamentoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PetService petService;
    private final ServicoService servicoService;
    private final UsuarioService usuarioService;

    public AgendamentoService(AgendamentoRepository agendamentoRepository, PetService petService, ServicoService servicoService, UsuarioService usuarioService) {
        this.agendamentoRepository = agendamentoRepository;
        this.petService = petService;
        this.servicoService = servicoService;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public Agendamento criarAgendamento(Long petId, Long servicoId, Long funcionarioId, LocalDateTime dataHoraInicio, String observacoes) {
        Pet pet = petService.buscarPetPorId(petId);
        Servico servico = servicoService.buscarServicoPorId(servicoId);
        LocalDateTime dataHoraFim = dataHoraInicio.plusMinutes(servico.getDuracaoMinutos());

        validarDataHora(dataHoraInicio);

        Agendamento agendamento = new Agendamento();
        agendamento.setPet(pet);
        agendamento.setServico(servico);
        agendamento.setDataHoraInicio(dataHoraInicio);
        agendamento.setDataHoraFim(dataHoraFim);
        agendamento.setObservacoes(observacoes);
        agendamento.setStatusAgendamento(StatusAgendamento.PENDENTE);

        if (funcionarioId != null) {
            Usuario funcionario = usuarioService.buscarUsuarioPorId(funcionarioId);
            validarFuncionario(funcionario);
            verificarConflito(funcionarioId, dataHoraInicio, dataHoraFim, null);
            agendamento.setFuncionarioResponsavel(funcionario);
        }

        return agendamentoRepository.save(agendamento);
    }

    private void verificarConflito(Long funcionarioId, LocalDateTime inicio, LocalDateTime fim, Long agendamentoIdIgnorado) {
        List<StatusAgendamento> ignorarStatus = List.of(
                StatusAgendamento.CANCELADO,
                StatusAgendamento.CONCLUIDO
        );

        List<Agendamento> conflitos = agendamentoRepository.verificarConflito(funcionarioId, inicio, fim, ignorarStatus);

        List<Agendamento> conflitosReais = conflitos.stream()
                .filter(a -> !a.getId().equals(agendamentoIdIgnorado))
                .toList();

        if (!conflitosReais.isEmpty()) {
            throw new RegraNegocioException("O funcionário já possui agendamento neste horário. " +
                    "Conflito com o agendamento ID: " + conflitosReais.get(0).getId());
        }
    }

    private void validarFuncionario(Usuario usuario) {
        if (usuario.getTipoUsuario() == TipoUsuario.CLIENTE) {
            throw new RegraNegocioException("O usuário informado não é um funcionário ou administrador");
        }
    }

    private void validarDataHora(LocalDateTime dataHoraInicio) {
        if (dataHoraInicio.isBefore(LocalDateTime.now())) {
            throw new RegraNegocioException("A data/hora não pode ser no passado");
        }
    }

    private void validarTransicaoStatus(StatusAgendamento atual, StatusAgendamento destino, List<StatusAgendamento> permitidos) {
        if (!permitidos.contains(atual)) {
            throw new RegraNegocioException(
                    "Não é possível mover para " + destino + " a partir do status " + atual);
        }
    }

    public Agendamento buscarAgendamentoPorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Agendamento não encontrado"));
    }

    public List<Agendamento> listarTodosAgendamentos() {
        return agendamentoRepository.findAll();
    }

    public List<Agendamento> listarAgendamentosPorPet(Long petId) {
        petService.buscarPetPorId(petId);
        return agendamentoRepository.findByPetId(petId);
    }

    public List<Agendamento> listarAgendamentosPorFuncionario(Long funcionarioId) {
        usuarioService.buscarUsuarioPorId(funcionarioId);
        return agendamentoRepository.findByFuncionarioResponsavelId(funcionarioId);
    }

    public List<Agendamento> listarAgendamentosPorStatus(StatusAgendamento status) {
        return agendamentoRepository.findByStatusAgendamento(status);
    }

    public List<Agendamento> listarAgendamentosPorData(LocalDate data) {
        LocalDateTime inicioDia = data.atStartOfDay();
        LocalDateTime fimDia = data.atTime(23, 59, 59);
        return agendamentoRepository.findByDataHoraInicioBetween(inicioDia, fimDia);
    }

    public List<Agendamento> listarAgendamentosPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio.isAfter(fim)) {
            throw new RegraNegocioException("A data de início não pode ser posterior à data de fim");
        }
        return agendamentoRepository.findByDataHoraInicioBetween(inicio, fim);
    }

    @Transactional
    public Agendamento atribuirFuncionario(Long agendamentoId, Long funcionarioId) {
        Agendamento agendamento = buscarAgendamentoPorId(agendamentoId);
        Usuario funcionario = usuarioService.buscarUsuarioPorId(funcionarioId);

        validarFuncionario(funcionario);
        verificarConflito(funcionarioId, agendamento.getDataHoraInicio(), agendamento.getDataHoraFim(), agendamentoId);

        agendamento.setFuncionarioResponsavel(funcionario);
        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = buscarAgendamentoPorId(id);
        validarTransicaoStatus(agendamento.getStatusAgendamento(),
                StatusAgendamento.CONFIRMADO, List.of(StatusAgendamento.PENDENTE));
        agendamento.setStatusAgendamento(StatusAgendamento.CONFIRMADO);
        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento iniciarAtendimento(Long id) {
        Agendamento agendamento = buscarAgendamentoPorId(id);
        validarTransicaoStatus(agendamento.getStatusAgendamento(),
                StatusAgendamento.EM_ANDAMENTO, List.of(StatusAgendamento.CONFIRMADO));

        if (agendamento.getFuncionarioResponsavel() == null) {
            throw new RegraNegocioException("É necessário atribuir um funcionário antes de iniciar o atendimento");
        }

        agendamento.setStatusAgendamento(StatusAgendamento.EM_ANDAMENTO);
        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento concluirAgendamento(Long id) {
        Agendamento agendamento = buscarAgendamentoPorId(id);
        validarTransicaoStatus(agendamento.getStatusAgendamento(),
                StatusAgendamento.CONCLUIDO, List.of(StatusAgendamento.EM_ANDAMENTO));
        agendamento.setStatusAgendamento(StatusAgendamento.CONCLUIDO);
        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento cancelarAgendamento(Long id, String motivo) {
        Agendamento agendamento = buscarAgendamentoPorId(id);
        validarTransicaoStatus(agendamento.getStatusAgendamento(), StatusAgendamento.CANCELADO,
                List.of(StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO, StatusAgendamento.EM_ANDAMENTO));

        agendamento.setStatusAgendamento(StatusAgendamento.CANCELADO);

        if (motivo != null && !motivo.isBlank()) {
            String obsAtual = agendamento.getObservacoes() != null ? agendamento.getObservacoes() : "";
            agendamento.setObservacoes(obsAtual + " | Cancelamento: " + motivo);
        }

        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento reagendar(Long id, LocalDateTime novaDataHoraInicio) {
        Agendamento agendamento = buscarAgendamentoPorId(id);

        validarTransicaoStatus(agendamento.getStatusAgendamento(), StatusAgendamento.PENDENTE,
                List.of(StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO, StatusAgendamento.EM_ANDAMENTO));

        validarDataHora(novaDataHoraInicio);

        int duracaoMinutos = agendamento.getServico().getDuracaoMinutos();
        LocalDateTime novaDataHoraFim = novaDataHoraInicio.plusMinutes(duracaoMinutos);

        if (agendamento.getFuncionarioResponsavel() != null) {
            verificarConflito(agendamento.getFuncionarioResponsavel().getId(),
                    novaDataHoraInicio, novaDataHoraFim, id);
        }

        agendamento.setDataHoraInicio(novaDataHoraInicio);
        agendamento.setDataHoraFim(novaDataHoraFim);
        agendamento.setStatusAgendamento(
                agendamento.getFuncionarioResponsavel() != null
                        ? StatusAgendamento.CONFIRMADO
                        : StatusAgendamento.PENDENTE
        );

        return agendamentoRepository.save(agendamento);
    }
}