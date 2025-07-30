"""
Configurações de LLM para o RAG Chatbot
Suporte para OpenAI e modelos locais (llama-cpp-python)
"""
import os
import logging
from typing import Optional


logger = logging.getLogger(__name__)

# =========================
# Configuração Ollama local
# =========================
import requests

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
LLM_MODEL = os.getenv("OLLAMA_LLM_MODEL", "gemma3n:e2b")

def get_embedding(text):
    """Gera embedding usando Ollama local (nomic-embed-text por padrão)"""
    response = requests.post(
        f"{OLLAMA_HOST}/api/embeddings",
        json={
            "model": EMBED_MODEL,
            "prompt": text
        }
    )
    return response.json()["embedding"]

def generate_response(context, question):
    """Gera resposta usando LLM local via Ollama (deepseek-r1:1.5b por padrão)"""
    prompt = f"{context}\n\nUsuário: {question}\nAssistente:"
    response = requests.post(
        f"{OLLAMA_HOST}/api/generate",
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": False
        }
    )
    return response.json()["response"]



# Função de configuração para pipeline RAG: sempre prioriza Ollama local
def get_llm_config():
    """Retorna configuração para uso local via Ollama (embeddings e LLM)"""
    config = {
        "type": "ollama-local",
        "embedding_fn": get_embedding,
        "llm_fn": generate_response,
        "embed_model": EMBED_MODEL,
        "llm_model": LLM_MODEL,
        "name": f"Ollama local: {LLM_MODEL} + {EMBED_MODEL}"
    }
    logger.info(f"✅ LLM configurado: {config['name']}")
    return config


# As funções de OpenAI e fallback podem ser mantidas para compatibilidade, mas não são usadas no pipeline local


# Não é mais necessário, pois get_llm_config já retorna a config local


def get_fallback_config():
    """Configuração de fallback (sem LLM específico)"""
    logger.warning("⚠️ Usando configuração de fallback - apenas recuperação de contexto")

    return {"type": "fallback", "llm": None, "name": "Fallback (somente recuperação)"}


def download_local_model():
    """
    Helper para baixar um modelo local recomendado
    Execute este método separadamente se quiser usar LLM local
    """
    import urllib.request

    model_url = "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.q4_0.gguf"
    model_path = "./models/llama-2-7b-chat.gguf"

    os.makedirs("./models", exist_ok=True)

    if os.path.exists(model_path):
        logger.info(f"✅ Modelo já existe: {model_path}")
        return model_path

    logger.info(f"📥 Baixando modelo: {model_url}")
    logger.info("⏳ Isso pode levar vários minutos...")

    try:
        urllib.request.urlretrieve(model_url, model_path)
        logger.info(f"✅ Modelo baixado: {model_path}")
        return model_path
    except Exception as e:
        logger.error(f"❌ Erro ao baixar modelo: {e}")
        return None


# Exemplo de uso das funções Ollama
if __name__ == "__main__":
    # Teste das funções
    texto = "FindAI Tools é uma plataforma de IA para produtividade."
    emb = get_embedding(texto)
    print(f"Embedding gerado (primeiros 5 valores): {emb[:5]}")

    contexto = "Texto recuperado mais relevante dos seus posts."
    pergunta = "Quais são as principais funções do FakeFind?"
    resposta = generate_response(contexto, pergunta)
    print(f"Resposta gerada: {resposta}")
