import { useState } from "react";
import { ProcessoDeDecisaoMarkov, Estado } from "./mdp";
import './App.css';

function App() {
  const [estadoAtual, setEstadoAtual] = useState<string>("Ponto de Partida");
  const [descricaoEstado, setDescricaoEstado] = useState<string>("Início da entrega de encomenda.");
  const [resultado, setResultado] = useState<string>("");
  const [acoesDisponiveis, setAcoesDisponiveis] = useState<string[]>([]);
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

  const mudarEstado = (acaoEscolhida: string) => {
    const estadoAtualObj = estados.find(estado => estado.nome === estadoAtual);
    if (!estadoAtualObj) return;

    const novoEstado = mdp.tomarDecisao(estadoAtualObj, acaoEscolhida);
    const estadoEscolhido = estados.find(estado => estado.nome === novoEstado);

    if (estadoEscolhido) {
      setEstadoAtual(estadoEscolhido.nome);
      setDescricaoEstado(estadoEscolhido.descricao);

      if (novoEstado === "Ponto de Partida") {
        setComentarios("📦 Centro de Distribuição: Selecione sua próxima rota de entrega.");
      } 
      else if (novoEstado.includes("Rota")) {
        const prob = estadoAtualObj.transicoes["Escolher Rota"]?.find(
          t => t.estadoDestino === novoEstado
        )?.probabilidade || 0;
        
        setComentarios(
          `🛣️ Rota Selecionada: ${estadoEscolhido.nome} (${(prob * 100).toFixed(0)}% chance de ser escolhida). ` +
          `Taxa de sucesso: ${(estadoEscolhido.transicoes["Concluir entrega"][0].probabilidade * 100).toFixed(0)}%`
        );
      } 
      else if (novoEstado.startsWith("Sucesso")) {
        setComentarios("🎉 Entrega concluída! " + estadoEscolhido.descricao);
      } 
      else if (novoEstado.includes("Falha")) {
        setComentarios("⚠️ " + estadoEscolhido.descricao);
      }

      if (novoEstado.startsWith("Sucesso")) {
        setResultado("✅ Missão cumprida!");
        setAcoesDisponiveis(["Finalizar"]);
      } 
      else if (novoEstado.includes("Falha")) {
        setResultado("❌ Entrega não realizada");
        setAcoesDisponiveis(["Tentar novamente"]);
      } 
      else if (novoEstado.includes("Rota")) {
        setResultado(`🛣️ Pronto para entregar via ${estadoEscolhido.nome}`);
        setAcoesDisponiveis(["Concluir entrega"]);
      }
    }
  };

  return (
    <div className="App">
      <h1>🚚 Sistema de Entregas Markoviano</h1>
      <div className="card">
        <p><strong>📍 Estado Atual:</strong> {estadoAtual}</p>
        <p><strong>📝 Detalhes:</strong> {descricaoEstado}</p>
        <p className="resultado">{resultado}</p>

        <div className="comentario">
          <strong>💬 Status:</strong> {comentarios}
        </div>

        {estadoAtual === "Ponto de Partida" ? (
          <div>
            <button onClick={() => mudarEstado("Escolher Rota")}>
              🗺️ Escolher Rota de Entrega
            </button>
          </div>
        ) : (
          <div className="acoes">
            {acoesDisponiveis.map((acao, index) => (
              <button key={index} onClick={() => mudarEstado(acao)}>
                {acao.includes("Finalizar") ? "🏁 Finalizar" : 
                 acao.includes("Tentar") ? "🔄 Tentar novamente" : 
                 "📦 Concluir entrega"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;