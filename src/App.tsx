import { useState } from "react";
import { ProcessoDeDecisaoMarkov, Estado } from "./mdp"; // Importando o MDP
import './App.css'; // Importando o CSS

function App() {
  const [estadoAtual, setEstadoAtual] = useState<string>("Ponto de Partida");
  const [descricaoEstado, setDescricaoEstado] = useState<string>("Início da entrega de encomenda.");
  const [resultado, setResultado] = useState<string>("");
  const [acoesDisponiveis, setAcoesDisponiveis] = useState<string[]>([]);

  // Definir os estados com suas transições e probabilidades
  const estados: Estado[] = [
    {
      nome: "Ponto de Partida", 
      descricao: "O agente começa a entrega de encomenda.",
      transicoes: {
        "Escolher Rota": [
          { estadoDestino: "Rota 1A", probabilidade: 0.25 },
          { estadoDestino: "Rota 1B", probabilidade: 0.25 },
          { estadoDestino: "Rota 2A", probabilidade: 0.25 },
          { estadoDestino: "Rota 2B", probabilidade: 0.25 }
        ]
      }
    },
    {
      nome: "Rota 1A", 
      descricao: "Rota 1A, mas há risco de neve.",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso", probabilidade: 0.7 },
          { estadoDestino: "Falha por Neve", probabilidade: 0.3 }
        ]
      }
    },
    {
      nome: "Rota 1B", 
      descricao: "Rota 1B, possibilidade de fechamento de estrada.",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso", probabilidade: 0.6 },
          { estadoDestino: "Falha por Fechamento", probabilidade: 0.4 }
        ]
      }
    },
    {
      nome: "Rota 2A", 
      descricao: "Rota 2A, com risco de pista escorregadia.",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso", probabilidade: 0.8 },
          { estadoDestino: "Falha por Pista Escorregadia", probabilidade: 0.2 }
        ]
      }
    },
    {
      nome: "Rota 2B", 
      descricao: "Rota 2B, com alto tráfego.",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso", probabilidade: 0.5 },
          { estadoDestino: "Falha por Tráfego", probabilidade: 0.5 }
        ]
      }
    },
    {
      nome: "Sucesso", 
      descricao: "A entrega foi realizada com sucesso.",
      transicoes: {
        "Finalizar": [
          { estadoDestino: "Ponto de Partida", probabilidade: 1.0 }
        ]
      }
    },
    {
      nome: "Falha por Neve", 
      descricao: "Falha devido a neve.",
      transicoes: {
        "Tentar novamente": [
          { estadoDestino: "Ponto de Partida", probabilidade: 1.0 }
        ]
      }
    },
    {
      nome: "Falha por Fechamento", 
      descricao: "Falha devido ao fechamento da estrada.",
      transicoes: {
        "Tentar novamente": [
          { estadoDestino: "Ponto de Partida", probabilidade: 1.0 }
        ]
      }
    },
    {
      nome: "Falha por Pista Escorregadia", 
      descricao: "Falha devido à pista escorregadia.",
      transicoes: {
        "Tentar novamente": [
          { estadoDestino: "Ponto de Partida", probabilidade: 1.0 }
        ]
      }
    },
    {
      nome: "Falha por Tráfego", 
      descricao: "Falha devido ao tráfego.",
      transicoes: {
        "Tentar novamente": [
          { estadoDestino: "Ponto de Partida", probabilidade: 1.0 }
        ]
      }
    }
  ];

  const mdp = new ProcessoDeDecisaoMarkov(estados);

  const mudarEstado = (acaoEscolhida: string) => {
    const estadoAtualObj = estados.find(estado => estado.nome === estadoAtual);
    if (!estadoAtualObj) return;

    const novoEstado = mdp.tomarDecisao(estadoAtualObj, acaoEscolhida);

    const estadoEscolhido = estados.find(estado => estado.nome === novoEstado);

    if (estadoEscolhido) {
      setEstadoAtual(estadoEscolhido.nome);
      setDescricaoEstado(estadoEscolhido.descricao);

      if (novoEstado === "Sucesso") {
        setResultado("Entrega realizada com sucesso!");
        setAcoesDisponiveis(["Finalizar"]);
      } else if (novoEstado.includes("Falha")) {
        setResultado("Falha na entrega! Tentando novamente...");
        setAcoesDisponiveis(["Tentar novamente"]);
      } else {
        setResultado("Transição bem-sucedida!");
        setAcoesDisponiveis(["Concluir entrega"]);
      }
    }
  };

  return (
    <div className="App">
      <h1>Processo de Decisão de Markov - Agente de Entrega</h1>
      <div className="card">
        <p><strong>Estado Atual:</strong> {estadoAtual}</p>
        <p><strong>Descrição:</strong> {descricaoEstado}</p>
        <p>{resultado}</p>

        {/* Botão para Escolher a Rota com Probabilidade */}
        {estadoAtual === "Ponto de Partida" && (
          <div>
            <button onClick={() => mudarEstado("Escolher Rota")}>Escolher Rota</button>
          </div>
        )}

        {/* Botão para ações Filhas e Netas */}
        {estadoAtual !== "Ponto de Partida" && acoesDisponiveis.length > 0 && (
          <div>
            {acoesDisponiveis.map((acao, index) => (
              <button key={index} onClick={() => mudarEstado(acao)}>{acao}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
