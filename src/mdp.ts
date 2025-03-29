export type Transicao = {
  estadoDestino: string;
  probabilidade: number;
};

export type Estado = {
  nome: string;
  descricao: string;
  transicoes: { [acao: string]: Transicao[] };
};

export class ProcessoDeDecisaoMarkov {
  private estados: Estado[];

  constructor(estados: Estado[]) {
    // Validação das probabilidades ao construir o MDP
    estados.forEach(estado => {
      for (const acao in estado.transicoes) {
        const transicoes = estado.transicoes[acao];
        const totalProb = transicoes.reduce((sum, t) => sum + t.probabilidade, 0);
        
        // Normaliza probabilidades se não somarem 1
        if (Math.abs(totalProb - 1) > 0.0001) {
          console.warn(`Probabilidades não somam 1 no estado ${estado.nome}, ação ${acao}. Normalizando...`);
          transicoes.forEach(t => {
            t.probabilidade = t.probabilidade / totalProb;
          });
        }
      }
    });
    
    this.estados = estados;
  }

  public tomarDecisao(estadoAtual: Estado, acaoEscolhida: string): string {
    if (!estadoAtual.transicoes[acaoEscolhida]) {
      console.error(`Ação '${acaoEscolhida}' não encontrada no estado '${estadoAtual.nome}'`);
      return estadoAtual.nome;
    }

    const transicoes = estadoAtual.transicoes[acaoEscolhida];
    const random = Math.random();
    let probabilidadeAcumulada = 0;

    for (const transicao of transicoes) {
      probabilidadeAcumulada += transicao.probabilidade;
      if (random < probabilidadeAcumulada) {
        return transicao.estadoDestino;
      }
    }

    // Fallback seguro
    return transicoes[transicoes.length - 1].estadoDestino;
  }

  public getEstado(nome: string): Estado | undefined {
    return this.estados.find(estado => estado.nome === nome);
  }
}