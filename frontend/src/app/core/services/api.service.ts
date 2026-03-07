import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Cliente, ClienteRequest, ClienteUpdateRequest,
  Funcionario, FuncionarioRequest,
  Pet, PetRequest,
  Servico, ServicoRequest,
  Agendamento, AgendamentoRequest,
  StatusAgendamento
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private http: HttpClient) {}
  listar()               { return this.http.get<Cliente[]>('/api/clientes'); }
  buscar(id: number)     { return this.http.get<Cliente>(`/api/clientes/${id}`); }
  criar(d: ClienteRequest) { return this.http.post<Cliente>('/api/clientes', d); }
  atualizar(id: number, d: ClienteUpdateRequest) { return this.http.put<Cliente>(`/api/clientes/${id}`, d); }
  deletar(id: number)    { return this.http.delete<void>(`/api/clientes/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class FuncionariosService {
  constructor(private http: HttpClient) {}
  listar()                   { return this.http.get<Funcionario[]>('/api/funcionarios'); }
  buscar(id: number)         { return this.http.get<Funcionario>(`/api/funcionarios/${id}`); }
  criar(d: FuncionarioRequest) { return this.http.post<Funcionario>('/api/funcionarios', d); }
  atualizar(id: number, d: any) { return this.http.put<Funcionario>(`/api/funcionarios/${id}`, d); }
  deletar(id: number)        { return this.http.delete<void>(`/api/funcionarios/${id}`); }
  promover(id: number)       { return this.http.patch<Funcionario>(`/api/funcionarios/${id}/promover`, {}); }
  rebaixar(id: number)       { return this.http.patch<Funcionario>(`/api/funcionarios/${id}/rebaixar`, {}); }
}

@Injectable({ providedIn: 'root' })
export class PetsService {
  constructor(private http: HttpClient) {}
  listar()                       { return this.http.get<Pet[]>('/api/pets'); }
  listarPorCliente(cid: number)  { return this.http.get<Pet[]>(`/api/pets/clientes/${cid}`); }
  buscar(id: number)             { return this.http.get<Pet>(`/api/pets/${id}`); }
  criar(cid: number, d: PetRequest) { return this.http.post<Pet>(`/api/pets/clientes/${cid}`, d); }
  atualizar(id: number, d: PetRequest) { return this.http.put<Pet>(`/api/pets/${id}`, d); }
  deletar(id: number)            { return this.http.delete<void>(`/api/pets/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ServicosService {
  constructor(private http: HttpClient) {}
  listar()                      { return this.http.get<Servico[]>('/api/servicos'); }
  listarAtivos()                { return this.http.get<Servico[]>('/api/servicos/ativos'); }
  buscar(id: number)            { return this.http.get<Servico>(`/api/servicos/${id}`); }
  criar(d: ServicoRequest)      { return this.http.post<Servico>('/api/servicos', d); }
  atualizar(id: number, d: ServicoRequest) { return this.http.put<Servico>(`/api/servicos/${id}`, d); }
  deletar(id: number)           { return this.http.delete<void>(`/api/servicos/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class AgendamentosService {
  constructor(private http: HttpClient) {}
  listar()                         { return this.http.get<Agendamento[]>('/api/agendamentos'); }
  listarPorCliente(cid: number)    { return this.http.get<Agendamento[]>(`/api/agendamentos/cliente/${cid}`); }
  listarPorStatus(s: StatusAgendamento) { return this.http.get<Agendamento[]>(`/api/agendamentos/status/${s}`); }
  buscar(id: number)               { return this.http.get<Agendamento>(`/api/agendamentos/${id}`); }
  criar(d: AgendamentoRequest)     { return this.http.post<Agendamento>('/api/agendamentos', d); }
  confirmar(id: number)            { return this.http.patch<Agendamento>(`/api/agendamentos/${id}/confirmar`, {}); }
  iniciar(id: number)              { return this.http.patch<Agendamento>(`/api/agendamentos/${id}/iniciar`, {}); }
  concluir(id: number)             { return this.http.patch<Agendamento>(`/api/agendamentos/${id}/concluir`, {}); }
  cancelar(id: number, motivo: string) { return this.http.patch<Agendamento>(`/api/agendamentos/${id}/cancelar`, { motivo }); }
  reagendar(id: number, novaDataHoraInicio: string) { return this.http.patch<Agendamento>(`/api/agendamentos/${id}/reagendar`, { novaDataHoraInicio }); }
  atribuirFuncionario(id: number, fid: number) { return this.http.patch<Agendamento>(`/api/agendamentos/${id}/funcionario/${fid}`, {}); }
}