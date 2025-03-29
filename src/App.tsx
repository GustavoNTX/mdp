import { useState } from "react";
import { ProcessoDeDecisaoMarkov, Estado } from "./mdp";
import './App.css';

function App() {
  const [estadoAtual, setEstadoAtual] = useState<string>("Ponto de Partida");
  const [descricaoEstado, setDescricaoEstado] = useState<string>("Início da entrega de encomenda.");
  const [resultado, setResultado] = useState<string>("");
  const [comentarios, setComentarios] = useState<string>("");

  const estados: Estado[] = [
    {
      nome: "Ponto de Partida", 
      descricao: "Você está no centro de distribuição com a encomenda em mãos.",
      transicoes: {
        "Escolher Rota": [
          { estadoDestino: "Rota 1A", probabilidade: 0.20 },
          { estadoDestino: "Rota 1B", probabilidade: 0.30 },
          { estadoDestino: "Rota 2A", probabilidade: 0.35 },
          { estadoDestino: "Rota 2B", probabilidade: 0.15 }
        ]
      }
    },
    {
      nome: "Rota 1A", 
      descricao: "Rota montanhosa - Caminho mais curto mas com 40% de chance de neve.",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso Rota 1A", probabilidade: 0.6 },
          { estadoDestino: "Falha por Neve", probabilidade: 0.4 }
        ]
      }
    },
    {
      nome: "Rota 1B", 
      descricao: "Rota urbana - Estrada principal com possibilidade de obras (30%).",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso Rota 1B", probabilidade: 0.7 },
          { estadoDestino: "Falha por Fechamento", probabilidade: 0.3 }
        ]
      }
    },
    {
      nome: "Rota 2A", 
      descricao: "Rota cênica - Paisagem bonita mas pista molhada (15% risco).",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso Rota 2A", probabilidade: 0.85 },
          { estadoDestino: "Falha por Pista Escorregadia", probabilidade: 0.15 }
        ]
      }
    },
    {
      nome: "Rota 2B", 
      descricao: "Rota expressa - Mais rápida mas com 50% de congestionamento.",
      transicoes: {
        "Concluir entrega": [
          { estadoDestino: "Sucesso Rota 2B", probabilidade: 0.5 },
          { estadoDestino: "Falha por Tráfego", probabilidade: 0.5 }
        ]
      }
    },
    {
      nome: "Sucesso Rota 1A", 
      descricao: "✅ Entrega perfeita! Entregue pessoalmente ao destinatário com aviso de recebimento.",
      transicoes: {
        "Finalizar": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Sucesso Rota 1B", 
      descricao: "⚠️ Entrega rápida! Pacote deixado na portaria e jogado por cima do muro pelo zelador.",
      transicoes: {
        "Finalizar": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Sucesso Rota 2A", 
      descricao: "🤝 Entrega alternativa! A vizinha Dona Maria aceitou receber a encomenda pelo destinatário.",
      transicoes: {
        "Finalizar": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Sucesso Rota 2B", 
      descricao: "🏠 Entrega padrão! Pacote deixado na porta da residência com foto de confirmação.",
      transicoes: {
        "Finalizar": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Falha por Neve", 
      descricao: "❄️ Falha crítica! A neve bloqueou a estrada. O pacote voltará ao centro de distribuição.",
      transicoes: {
        "Tentar novamente": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Falha por Fechamento", 
      descricao: "🚧 Falha operacional! A rua está interditada para obras. Tentaremos novo horário.",
      transicoes: {
        "Tentar novamente": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Falha por Pista Escorregadia", 
      descricao: "💢 Acidente! O veículo derrapou na pista molhada. A encomenda sofreu pequenos danos.",
      transicoes: {
        "Tentar novamente": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    },
    {
      nome: "Falha por Tráfego", 
      descricao: "🚗💨 Atraso crítico! O congestionamento fez a entrega ultrapassar o prazo máximo.",
      transicoes: {
        "Tentar novamente": [{ estadoDestino: "Ponto de Partida", probabilidade: 1.0 }]
      }
    }
  ];

  const mdp = new ProcessoDeDecisaoMarkov(estados);

  const getAcaoDoEstado = (estado: string): string => {
    if (estado === "Ponto de Partida") return "Escolher Rota";
    if (estado.startsWith("Sucesso")) return "Finalizar";
    if (estado.includes("Falha")) return "Tentar novamente";
    if (estado.includes("Rota")) return "Concluir entrega";
    return "";
  };

  const mudarEstado = (acaoEscolhida: string) => {
    const estadoAtualObj = mdp.getEstado(estadoAtual);
    if (!estadoAtualObj) {
      console.error(`Estado atual '${estadoAtual}' não encontrado`);
      setComentarios("⚠️ Erro: Estado não encontrado. Reiniciando...");
      setEstadoAtual("Ponto de Partida");
      return;
    }

    try {
      // Tratamento especial para o estado de sucesso
      if (estadoAtual.startsWith("Sucesso") && acaoEscolhida === "Finalizar") {
        setEstadoAtual("Ponto de Partida");
        setDescricaoEstado("Início da entrega de encomenda.");
        setResultado("🔄 Processo reiniciado");
        setComentarios("📦 Centro de Distribuição: Selecione sua próxima rota de entrega.");
        return;
      }

      const novoEstadoNome = mdp.tomarDecisao(estadoAtualObj, acaoEscolhida);
      const novoEstadoObj = mdp.getEstado(novoEstadoNome);

      if (!novoEstadoObj) {
        console.error(`Estado destino '${novoEstadoNome}' não encontrado`);
        setComentarios("⚠️ Erro: Próximo estado não encontrado. Reiniciando...");
        setEstadoAtual("Ponto de Partida");
        return;
      }

      setEstadoAtual(novoEstadoObj.nome);
      setDescricaoEstado(novoEstadoObj.descricao);

      // Atualiza resultado e comentários
      if (novoEstadoObj.nome === "Ponto de Partida") {
        setResultado("🔄 Processo reiniciado");
        setComentarios("📦 Centro de Distribuição: Selecione sua próxima rota de entrega.");
      } 
      else if (novoEstadoObj.nome.includes("Rota")) {
        const transicao = estadoAtualObj.transicoes[acaoEscolhida]?.find(t => t.estadoDestino === novoEstadoObj.nome);
        const transicaoEntrega = novoEstadoObj.transicoes["Concluir entrega"]?.[0];
        
        setResultado(`🛣️ Rota ${novoEstadoObj.nome} selecionada`);
        setComentarios(
          `Você escolheu: ${novoEstadoObj.descricao}` +
          (transicao ? ` (Chance inicial: ${Math.round(transicao.probabilidade * 100)}%)` : "") +
          (transicaoEntrega ? ` - Chance de sucesso: ${Math.round(transicaoEntrega.probabilidade * 100)}%` : "")
        );
      } 
      else if (novoEstadoObj.nome.startsWith("Sucesso")) {
        setResultado("🎉 Entrega concluída com sucesso!");
        setComentarios(novoEstadoObj.descricao);
      } 
      else if (novoEstadoObj.nome.includes("Falha")) {
        setResultado("❌ Falha na entrega");
        setComentarios(novoEstadoObj.descricao);
      }

    } catch (error) {
      console.error("Erro na transição:", error);
      setComentarios("⚠️ Erro inesperado. Reiniciando sistema...");
      setEstadoAtual("Ponto de Partida");
    }
  };

  // Determina qual ação mostrar com base no estado atual
  const acaoAtual = getAcaoDoEstado(estadoAtual);
  const textoBotao = 
    acaoAtual === "Finalizar" ? "🏁 Finalizar" :
    acaoAtual === "Tentar novamente" ? "🔄 Tentar Novamente" :
    acaoAtual === "Escolher Rota" ? "🗺️ Selecionar Rota" :
    "📦 Concluir Entrega";

  return (
    <div className="App">
      <h1>🚚 Sistema de Entregas Inteligente</h1>
      <div className="card">
        <div className="status">
          <p><strong>📍 Estado Atual:</strong> {estadoAtual}</p>
          <p><strong>📝 Situação:</strong> {descricaoEstado}</p>
        </div>
        
        <div className="resultado">
          {resultado && <p>{resultado}</p>}
          <p><strong>💬 Detalhes:</strong> {comentarios}</p>
        </div>

        <div className="botoes">
          {acaoAtual && (
            <button
              onClick={() => mudarEstado(acaoAtual)}
              className={
                acaoAtual === "Finalizar" ? "btn-sucesso" :
                acaoAtual === "Tentar novamente" ? "btn-alerta" : 
                "btn-primario"
              }
            >
              {textoBotao}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;