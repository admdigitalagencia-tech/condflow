import type { Condominio, Ocorrencia, Assembleia } from "@/types";

export const mockCondominios: Condominio[] = [
  { id: "1", nome: "Edifício Aurora", morada: "Rua da Liberdade, 45", codigoPostal: "1250-142", cidade: "Lisboa", nif: "501234567", observacoes: "Edifício com 24 frações", ativo: true, criadoEm: "2024-01-15" },
  { id: "2", nome: "Condomínio Sol Nascente", morada: "Av. da República, 120", codigoPostal: "4000-281", cidade: "Porto", nif: "502345678", observacoes: "12 frações, garagem subterrânea", ativo: true, criadoEm: "2024-02-20" },
  { id: "3", nome: "Residencial Tejo", morada: "Praça do Comércio, 8", codigoPostal: "1100-148", cidade: "Lisboa", nif: "503456789", observacoes: "Edifício histórico, 18 frações", ativo: true, criadoEm: "2024-03-10" },
  { id: "4", nome: "Bloco Central", morada: "Rua Augusta, 200", codigoPostal: "3000-150", cidade: "Coimbra", nif: "504567890", observacoes: "", ativo: false, criadoEm: "2023-11-05" },
  { id: "5", nome: "Villa Garden", morada: "Estrada da Luz, 55", codigoPostal: "1600-155", cidade: "Lisboa", nif: "505678901", observacoes: "Condomínio fechado, 6 moradias", ativo: true, criadoEm: "2024-04-01" },
];

export const mockOcorrencias: Ocorrencia[] = [
  { id: "1", condominioId: "1", condominioNome: "Edifício Aurora", titulo: "Infiltração na garagem", descricao: "Água a entrar pela junta de dilatação no piso -1", categoria: "Infiltração", subcategoria: "Garagem", local: "Piso -1", prioridade: "Alta", status: "Em Execução", origem: "Condómino", responsavel: "João Silva", fornecedor: "HidroFix Lda", dataAbertura: "2025-02-15", prazoPrevisto: "2025-03-20", custoEstimado: 2500, custoAprovado: 2200, resolucao: "" },
  { id: "2", condominioId: "1", condominioNome: "Edifício Aurora", titulo: "Portão da garagem avariado", descricao: "Motor do portão automático não funciona", categoria: "Portão", subcategoria: "Garagem", local: "Entrada garagem", prioridade: "Crítica", status: "Aberto", origem: "Administração", responsavel: "", fornecedor: "", dataAbertura: "2025-03-10", prazoPrevisto: "2025-03-15", custoEstimado: 800, custoAprovado: 0, resolucao: "" },
  { id: "3", condominioId: "2", condominioNome: "Condomínio Sol Nascente", titulo: "Elevador parado", descricao: "Elevador principal fora de serviço", categoria: "Elevador", subcategoria: "", local: "Entrada principal", prioridade: "Crítica", status: "Orçamento Solicitado", origem: "Condómino", responsavel: "Ana Costa", fornecedor: "ThyssenKrupp", dataAbertura: "2025-03-08", prazoPrevisto: "2025-03-25", custoEstimado: 4500, custoAprovado: 0, resolucao: "" },
  { id: "4", condominioId: "3", condominioNome: "Residencial Tejo", titulo: "Lâmpadas fundidas no hall", descricao: "Substituir iluminação LED do hall de entrada", categoria: "Eletricidade", subcategoria: "Iluminação", local: "Hall R/C", prioridade: "Baixa", status: "Resolvido", origem: "Inspeção", responsavel: "Carlos Mendes", fornecedor: "ElectroLuz", dataAbertura: "2025-01-20", prazoPrevisto: "2025-02-01", custoEstimado: 150, custoAprovado: 130, resolucao: "Lâmpadas substituídas em 28/01" },
  { id: "5", condominioId: "2", condominioNome: "Condomínio Sol Nascente", titulo: "Canalização entupida", descricao: "Esgoto do piso 3 entupido, mau cheiro", categoria: "Canalização", subcategoria: "Esgoto", local: "Piso 3", prioridade: "Média", status: "Aguardando Aprovação", origem: "Condómino", responsavel: "Ana Costa", fornecedor: "", dataAbertura: "2025-03-01", prazoPrevisto: "2025-03-20", custoEstimado: 600, custoAprovado: 0, resolucao: "" },
  { id: "6", condominioId: "5", condominioNome: "Villa Garden", titulo: "Limpeza áreas comuns atrasada", descricao: "Empresa de limpeza não compareceu há 2 semanas", categoria: "Limpeza", subcategoria: "", local: "Áreas comuns", prioridade: "Média", status: "Em Análise", origem: "Condómino", responsavel: "Maria Santos", fornecedor: "LimpaMax", dataAbertura: "2025-03-05", prazoPrevisto: "2025-03-12", custoEstimado: 0, custoAprovado: 0, resolucao: "" },
  { id: "7", condominioId: "1", condominioNome: "Edifício Aurora", titulo: "Fissura na fachada", descricao: "Fissura visível na fachada norte, piso 5", categoria: "Estrutural", subcategoria: "Fachada", local: "Fachada Norte", prioridade: "Alta", status: "Em Análise", origem: "Inspeção", responsavel: "João Silva", fornecedor: "", dataAbertura: "2025-03-09", prazoPrevisto: "2025-04-15", custoEstimado: 8000, custoAprovado: 0, resolucao: "" },
];

export const mockAssembleias: Assembleia[] = [
  { id: "1", condominioId: "1", condominioNome: "Edifício Aurora", tipo: "Ordinária", data: "2025-04-15", hora: "19:00", local: "Salão do condomínio", estado: "Agendada", ordemTrabalhos: "1. Aprovação de contas\n2. Orçamento anual\n3. Obras na fachada\n4. Diversos", notasGestor: "Preparar relatório financeiro", pontos: [] },
  { id: "2", condominioId: "2", condominioNome: "Condomínio Sol Nascente", tipo: "Extraordinária", data: "2025-03-28", hora: "20:00", local: "Online via Zoom", estado: "Agendada", ordemTrabalhos: "1. Substituição do elevador\n2. Aprovação de orçamento extraordinário", notasGestor: "Obter 3 orçamentos para elevador", pontos: [] },
  { id: "3", condominioId: "3", condominioNome: "Residencial Tejo", tipo: "Ordinária", data: "2025-02-10", hora: "18:30", local: "Junta de Freguesia", estado: "Concluída", ordemTrabalhos: "1. Aprovação de contas 2024\n2. Eleição de administração\n3. Diversos", notasGestor: "Ata pendente de redação", pontos: [{ id: "p1", ordem: 1, titulo: "Aprovação de contas 2024", descricao: "", resumoDiscussao: "Contas aprovadas por unanimidade", proposta: "Aprovar contas conforme apresentado", resultadoVotacao: "Aprovado por unanimidade", deliberacao: "Contas de 2024 aprovadas" }] },
];

// Helpers
export function getOcorrenciasAbertas() {
  return mockOcorrencias.filter(o => !["Resolvido", "Encerrado"].includes(o.status));
}
export function getOcorrenciasCriticas() {
  return mockOcorrencias.filter(o => o.prioridade === "Crítica" && !["Resolvido", "Encerrado"].includes(o.status));
}
export function getOcorrenciasAtrasadas() {
  const today = new Date().toISOString().split("T")[0];
  return mockOcorrencias.filter(o => o.prazoPrevisto < today && !["Resolvido", "Encerrado"].includes(o.status));
}
export function getAssembleiasAgendadas() {
  return mockAssembleias.filter(a => a.estado === "Agendada");
}
export function getAtasPendentes() {
  return mockAssembleias.filter(a => a.estado === "Concluída" && a.pontos.length <= 1);
}
