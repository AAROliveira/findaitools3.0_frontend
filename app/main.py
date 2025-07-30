"""
Backend FastAPI para RAG Chatbot - FindAI Tools
Sistema de chat baseado em RAG (Retrieval-Augmented Generation)
Versão com suporte ao Ollama
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import sys
from pathlib import Path
import logging
from typing import List, Dict, Any, Optional, cast
from contextlib import asynccontextmanager

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Adiciona o diretório raiz ao path para imports
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

try:
    from llama_index.core import StorageContext, load_index_from_storage, Settings
    from llama_index.core.retrievers import VectorIndexRetriever
    from llama_index.core.query_engine import RetrieverQueryEngine
    from llama_index.core.postprocessor import SimilarityPostprocessor
    from llama_index.core.indices.vector_store import VectorStoreIndex
    from llama_index.embeddings.ollama import OllamaEmbedding
    from llama_index.llms.ollama import Ollama
except ImportError as e:
    logger.error(f"Erro ao importar LlamaIndex: {e}")
    logger.error(
        "Execute: pip install llama-index llama-index-embeddings-ollama llama-index-llms-ollama"
    )
    sys.exit(1)

# Importa configurações do Ollama
try:
    from ollama_config import OllamaManager, get_ollama_config
except ImportError:
    logger.warning("Configurações Ollama não encontradas, usando configuração padrão")

    def get_ollama_config():
        return {
            "embedding_model": "nomic-embed-text",
            "chat_model": "gemma3n:e2b",
            "base_url": "http://127.0.0.1:11434",
        }

    # Classe stub simples
    OllamaManager = None


# Configurações
PERSIST_DIR = "./embeddings"
SIMILARITY_CUTOFF = (
    0.3  # Limiar de similaridade para filtrar resultados (mais permissivo)
)
USE_OLLAMA = os.getenv("USE_OLLAMA", "true").lower() == "true"


# Modelos Pydantic
class ChatRequest(BaseModel):
    question: str
    max_results: int = 5


class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}


class HealthResponse(BaseModel):
    status: str
    index_loaded: bool
    embeddings_path: str


# Classe para gerenciar o índice
class RAGManager:
    def __init__(self):
        from app.local_search import LocalSemanticSearch
        self.local_search = None
        self.is_loaded = False

    def load_index(self):
        """Carrega embeddings/textos locais para busca semântica. Se não existirem, exibe instrução clara."""
        import os
        embeddings_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../embeddings/embeddings.npy'))
        texts_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../embeddings/texts.pkl'))
        if not (os.path.exists(embeddings_path) and os.path.exists(texts_path)):
            logger.error(f"❌ Arquivos de embeddings/textos não encontrados!\n\nEsperado:\n  - {embeddings_path}\n  - {texts_path}\n\nExecute: .venv\\Scripts\\activate && python ingest/build_index.py\n\nDepois, reinicie o backend.")
            self.is_loaded = False
            raise FileNotFoundError(f"Embeddings/textos não encontrados. Execute: .venv\\Scripts\\activate && python ingest/build_index.py")
        try:
            from app.local_search import LocalSemanticSearch
            self.local_search = LocalSemanticSearch(embeddings_path, texts_path)
            self.is_loaded = True
            logger.info("✅ Embeddings/textos carregados para busca local!")
        except Exception as e:
            logger.error(f"❌ Erro ao carregar embeddings/textos: {e}")
            self.is_loaded = False
            raise

    def query(self, question: str, max_results: int = 5) -> ChatResponse:
        """Executa uma consulta RAG local (busca semântica + LLM)"""
        if not self.is_loaded or self.local_search is None:
            raise HTTPException(status_code=500, detail="Embeddings/textos não carregados")

        try:
            logger.info(f"Processando pergunta: {question}")
            # Busca semântica local
            results = self.local_search.search(question, top_k=max_results)
            logger.info(f"Top resultados: {len(results)}")
            # Concatena os textos mais relevantes para contexto
            context = "\n---\n".join([r['content'] for r in results])
            # Gera resposta usando LLM local
            from app.llm_config import generate_response
            answer = generate_response(context, question)
            sources = [
                {
                    "content": r["content"][:200] + ("..." if len(r["content"]) > 200 else ""),
                    "score": r["score"],
                    "metadata": {},
                }
                for r in results
            ]
            metadata = {
                "question_length": len(question),
                "response_length": len(str(answer)),
                "sources_count": len(sources),
                "similarity_cutoff": SIMILARITY_CUTOFF,
            }
            logger.info(f"Processamento concluído. Fontes: {len(sources)}")
            return ChatResponse(
                response=str(answer), sources=sources[:max_results], metadata=metadata
            )
        except Exception as e:
            logger.error(f"❌ Erro na consulta: {e}")
            raise HTTPException(status_code=500, detail=f"Erro na consulta: {str(e)}")


# Inicializa o gerenciador RAG (Singleton para evitar múltiplas instâncias)
_rag_manager_instance = None


def get_rag_manager():
    global _rag_manager_instance
    if _rag_manager_instance is None:
        _rag_manager_instance = RAGManager()
    return _rag_manager_instance


rag_manager = get_rag_manager()


# Lifespan handler para substituir on_event
@asynccontextmanager
async def lifespan(app):
    try:
        rag_manager.load_index()
        logger.info("🚀 Servidor iniciado com sucesso!")
    except Exception as e:
        logger.error(f"❌ Falha na inicialização: {e}")
        logger.error(
            "Certifique-se de que o índice foi criado executando: python ingest/build_index.py"
        )
    yield
    logger.info("🛑 Servidor finalizado")

app = FastAPI(
    title="FindAI Tools RAG Chatbot",
    description="Sistema de chat baseado em RAG para consultas sobre ferramentas de IA",
    version="1.0.0",
    lifespan=lifespan,
)

# Middleware CORS (configurar adequadamente para produção)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],  # Ajustar para produção
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# Endpoints
@app.get("/", response_model=Dict[str, str])
async def root():
    """Endpoint raiz"""
    return {
        "message": "FindAI Tools RAG Chatbot API",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Verifica o status do sistema"""
    logger.info(
        f"Health check - is_loaded: {rag_manager.is_loaded}"
    )
    return HealthResponse(
        status="healthy" if rag_manager.is_loaded else "unhealthy",
        index_loaded=rag_manager.is_loaded,
        embeddings_path=PERSIST_DIR,
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint principal para chat

    Recebe uma pergunta e retorna resposta baseada em RAG
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Pergunta não pode estar vazia")

    if len(request.question) > 1000:
        raise HTTPException(
            status_code=400, detail="Pergunta muito longa (máximo 1000 caracteres)"
        )

    try:
        response = rag_manager.query(request.question, request.max_results)
        logger.info(f"✅ Resposta gerada para: '{request.question[:50]}...'")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro inesperado: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@app.get("/stats")
async def get_stats():
    """Retorna estatísticas do sistema"""
    if not rag_manager.is_loaded:
        return {"error": "Índice não carregado"}

    try:
        # Estatísticas básicas
        return {
            "index_loaded": True,
            "embeddings_path": PERSIST_DIR,
            "similarity_cutoff": SIMILARITY_CUTOFF,
            "status": "operational",
        }
    except Exception as e:
        return {"error": f"Erro ao obter estatísticas: {str(e)}"}


# Tratamento de erros global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Tratamento global de exceções"""
    logger.error(f"Erro não tratado: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Erro interno do servidor"})


if __name__ == "__main__":
    import uvicorn
    import socket
    import sys
    logger.info("🚀 Iniciando servidor FastAPI...")
    # Permitir definir porta via argumento ou variável de ambiente
    default_port = int(os.getenv("RAG_BACKEND_PORT", 8000))
    port = default_port
    # Checa argumento de linha de comando
    for i, arg in enumerate(sys.argv):
        if arg in ("--port", "-p") and i + 1 < len(sys.argv):
            try:
                port = int(sys.argv[i + 1])
            except Exception:
                pass
    # Tenta usar a porta escolhida, se ocupada, incrementa até achar livre
    max_tries = 10
    for _ in range(max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                break
            logger.warning(f"Porta {port} ocupada, tentando próxima...")
            port += 1
    else:
        logger.error("Não foi possível encontrar uma porta livre para o backend!")
        sys.exit(1)
    logger.info(f"Iniciando backend na porta {port}")
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False, log_level="info")
