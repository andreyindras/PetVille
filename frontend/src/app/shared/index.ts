export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuarioId: number;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';
  clienteId?: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';
  clienteId?: number;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  endereco?: string;
  telefone?: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface ClienteRequest {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  endereco?: string;
  telefone?: string;
}

export interface ClienteUpdateRequest {
  endereco?: string;
  telefone?: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: 'ADMIN' | 'FUNCIONARIO';
  dataCadastro: string;
}

export interface FuncionarioRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface Pet {
  id: number;
  clienteId: number;
  nomeCliente: string;
  nome: string;
  especie?: string;
  raca?: string;
  idade?: number;
  observacoes?: string;
}

export interface PetRequest {
  nome: string;
  especie?: string;
  raca?: string;
  idade?: number;
  observacoes?: string;
}

export type TipoServico = 'BANHO' | 'TOSA' | 'BANHO_TOSA' | 'HIGIENE_COMPLETA' |
  'CORTE_UNHAS' | 'LIMPEZA_OUVIDOS' | 'ESCOVACAO_DENTES' |
  'BANHO_MEDICINAL' | 'CONSULTA' | 'VACINA' | 'MEDICACAO' | 'OUTROS';

export interface Servico {
  id: number;
  nome: string;
  tipo: TipoServico;
  nomePersonalizado?: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
}

export interface ServicoRequest {
  nome: string;
  tipo: TipoServico;
  nomePersonalizado?: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
}

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface Agendamento {
  id: number;
  petId: number;
  nomePet: string;
  servicoId: number;
  nomeServico: string;
  funcionarioId?: number;
  nomeFuncionario?: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: StatusAgendamento;
  observacoes?: string;
}

export interface AgendamentoRequest {
  petId: number;
  servicoId: number;
  funcionarioId?: number;
  dataHoraInicio: string;
  observacoes?: string;
}