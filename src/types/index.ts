// Types for the condominium management system

export type Condominio = {
  id: string;
  nome: string;
  morada: string;
  codigoPostal: string;
  cidade: string;
  nif: string;
  observacoes: string;
  ativo: boolean;
  criadoEm: string;
};

export type Stakeholder = {
  id: string;
  condominioId: string;
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  observacoes: string;
};

export const CATEGORIAS = [
  "Infiltração", "Portão", "Elevador", "Eletricidade",
  "Canalização", "Limpeza", "Estrutural", "Administrativo", "Sinistro",
] as const;

export type Categoria = typeof CATEGORIAS[number];

export const PRIORIDADES = ["Baixa", "Média", "Alta", "Crítica"] as const;
export type Prioridade = typeof PRIORIDADES[number];

export const STATUS_OCORRENCIA = [
  "Aberto", "Em Análise", "Orçamento Solicitado",
  "Aguardando Aprovação", "Em Execução", "Resolvido", "Encerrado",
] as const;
export type StatusOcorrencia = typeof STATUS_OCORRENCIA[number];

export type Ocorrencia = {
  id: string;
  condominioId: string;
  condominioNome: string;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  subcategoria: string;
  local: string;
  prioridade: Prioridade;
  status: StatusOcorrencia;
  origem: string;
  responsavel: string;
  fornecedor: string;
  dataAbertura: string;
  prazoPrevisto: string;
  custoEstimado: number;
  custoAprovado: number;
  resolucao: string;
};

export const TIPOS_DOCUMENTO = [
  "Ata", "Convocatória", "Lista de Presença", "Orçamento",
  "Contrato", "Relatório Técnico", "Fatura", "Email Exportado",
  "Fotografia", "Áudio/Transcrição",
] as const;
export type TipoDocumento = typeof TIPOS_DOCUMENTO[number];

export type Documento = {
  id: string;
  condominioId: string;
  ocorrenciaId?: string;
  assembleiaId?: string;
  nome: string;
  tipo: TipoDocumento;
  url: string;
  criadoEm: string;
};

export const TIPOS_ASSEMBLEIA = ["Ordinária", "Extraordinária"] as const;
export type TipoAssembleia = typeof TIPOS_ASSEMBLEIA[number];

export const STATUS_ASSEMBLEIA = ["Agendada", "Em Curso", "Concluída", "Cancelada"] as const;
export type StatusAssembleia = typeof STATUS_ASSEMBLEIA[number];

export type PontoOrdem = {
  id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  resumoDiscussao: string;
  proposta: string;
  resultadoVotacao: string;
  deliberacao: string;
};

export type Assembleia = {
  id: string;
  condominioId: string;
  condominioNome: string;
  tipo: TipoAssembleia;
  data: string;
  hora: string;
  local: string;
  estado: StatusAssembleia;
  ordemTrabalhos: string;
  notasGestor: string;
  pontos: PontoOrdem[];
};
