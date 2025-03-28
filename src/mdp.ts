export type Estado = {
  nome: string;
  descricao: string;
  transicoes: { [acao: string]: { estadoDestino: string; probabilidade: number }[] };
};

export class ProcessoDeDecisaoMarkov {
  estados: Estado[];

  constructor(estados: Estado[]) {
    this.estados = estados;
  }

  tomarDecisao(estadoAtual: Estado, acaoEscolhida: string): string {
    const transicoes = estadoAtual.transicoes[acaoEscolhida];

    if (!transicoes) {
      return estadoAtual.nome;
    }

    const random = Math.random();
    let probabilidadeAcumulada = 0;

    // Escolhe o estado com base nas probabilidades
    for (let transicao of transicoes) {
      probabilidadeAcumulada += transicao.probabilidade;
      if (random < probabilidadeAcumulada) {
        return transicao.estadoDestino;
      }
    }

    return estadoAtual.nome;  // Caso não encontre transição, permanece no estado atual
  }
}
