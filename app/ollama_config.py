"""
Configurações e utilitários para Ollama
Suporte completo para embeddings e LLMs locais via Ollama
"""

import os
import json
import logging
import requests
from typing import Dict, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

# Configurações padrão do Ollama
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_API_TIMEOUT = 60

# Modelos recomendados por categoria
RECOMMENDED_EMBEDDING_MODELS = {
    "nomic-embed-text": {
        "size_mb": 274,
        "description": "Excelente para contextos longos (2048 tokens), supera ada-002",
        "use_case": "Recomendado para RAG geral",
        "context_length": 2048,
    },
    "mxbai-embed-large": {
        "size_mb": 335,
        "description": "SOTA BERT-large, robusto para domínio amplo",
        "use_case": "Melhor qualidade geral",
        "context_length": 512,
    },
    "all-minilm": {
        "size_mb": 67,
        "description": "Extremamente leve e rápido",
        "use_case": "Ideal para recursos limitados",
        "context_length": 256,
    },
    "snowflake-arctic-embed": {
        "size_mb": 568,
        "description": "Multilíngue, desempenho escalável",
        "use_case": "Textos multilíngues",
        "context_length": 512,
    },
}

RECOMMENDED_CHAT_MODELS = {
    "gemma3n:e2b": {
        "description": "Modelo eficiente, boa qualidade, recomendado para PT-BR",
        "use_case": "Recomendado para 32GB RAM, respostas em português"
    }
}


class OllamaManager:
    """Gerenciador para operações com Ollama"""

    def __init__(self, base_url: str = OLLAMA_BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        # Configure timeout nas requests, não na session
        self.timeout = OLLAMA_API_TIMEOUT

    def is_running(self) -> bool:
        """Verifica se o Ollama está rodando"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/tags", timeout=self.timeout
            )
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def list_models(self) -> List[Dict]:
        """Lista modelos instalados"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/tags", timeout=self.timeout
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("models", [])
            return []
        except Exception as e:
            logger.error(f"Erro ao listar modelos: {e}")
            return []

    def is_model_installed(self, model_name: str) -> bool:
        """Verifica se um modelo está instalado"""
        models = self.list_models()
        installed_names = [model["name"] for model in models]
        return model_name in installed_names

    def pull_model(self, model_name: str) -> bool:
        """Baixa um modelo do Ollama"""
        try:
            logger.info(f"📥 Baixando modelo: {model_name}")

            payload = {"name": model_name}
            response = self.session.post(
                f"{self.base_url}/api/pull",
                json=payload,
                stream=True,
                timeout=self.timeout,
            )

            if response.status_code == 200:
                # Processa stream de download
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "status" in data:
                                print(f"📦 {data['status']}")
                            if data.get("error"):
                                logger.error(f"Erro no download: {data['error']}")
                                return False
                        except json.JSONDecodeError:
                            continue

                logger.info(f"✅ Modelo {model_name} baixado com sucesso!")
                return True
            else:
                logger.error(f"Erro ao baixar modelo: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"Erro no download do modelo {model_name}: {e}")
            return False

    def generate_embedding(self, text: str, model: str) -> Optional[List[float]]:
        """Gera embedding usando Ollama"""
        try:
            payload = {"model": model, "prompt": text}

            response = self.session.post(
                f"{self.base_url}/api/embeddings", json=payload, timeout=self.timeout
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("embedding")
            else:
                logger.error(f"Erro ao gerar embedding: {response.status_code}")
                return None

        except Exception as e:
            logger.error(f"Erro na geração de embedding: {e}")
            return None

    def generate_response(self, prompt: str, model: str, **kwargs) -> Optional[str]:
        """Gera resposta usando modelo de chat do Ollama"""
        try:
            payload = {"model": model, "prompt": prompt, "stream": False, **kwargs}

            response = self.session.post(
                f"{self.base_url}/api/generate", json=payload, timeout=self.timeout
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("response")
            else:
                logger.error(f"Erro ao gerar resposta: {response.status_code}")
                return None

        except Exception as e:
            logger.error(f"Erro na geração de resposta: {e}")
            return None


def get_ollama_config() -> Dict:
    """Retorna configuração recomendada do Ollama"""

    # Configuração padrão
    embedding_model = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    chat_model = os.getenv("OLLAMA_CHAT_MODEL", "deepseek-r1:1.5b")

    config = {
        "embedding_model": embedding_model,
        "chat_model": chat_model,
        "base_url": os.getenv("OLLAMA_BASE_URL", OLLAMA_BASE_URL),
        "embedding_info": RECOMMENDED_EMBEDDING_MODELS.get(embedding_model, {}),
        "chat_info": RECOMMENDED_CHAT_MODELS.get(chat_model, {}),
    }

    return config


def setup_ollama_models(
    manager: Optional[OllamaManager] = None,
) -> Tuple[bool, List[str]]:
    """Configura modelos recomendados do Ollama"""

    if not manager:
        manager = OllamaManager()

    if not manager.is_running():
        logger.error("❌ Ollama não está rodando. Execute: ollama serve")
        return False, ["Ollama não está rodando"]

    config = get_ollama_config()
    embedding_model = config["embedding_model"]
    chat_model = config["chat_model"]

    messages = []
    success = True

    # Verifica/baixa modelo de embedding
    if not manager.is_model_installed(embedding_model):
        logger.info(f"📥 Baixando modelo de embedding: {embedding_model}")
        if manager.pull_model(embedding_model):
            messages.append(f"✅ Embedding model {embedding_model} instalado")
        else:
            messages.append(f"❌ Falha ao instalar {embedding_model}")
            success = False
    else:
        messages.append(f"✅ Embedding model {embedding_model} já instalado")

    # Verifica/baixa modelo de chat
    if not manager.is_model_installed(chat_model):
        logger.info(f"📥 Baixando modelo de chat: {chat_model}")
        if manager.pull_model(chat_model):
            messages.append(f"✅ Chat model {chat_model} instalado")
        else:
            messages.append(f"❌ Falha ao instalar {chat_model}")
            success = False
    else:
        messages.append(f"✅ Chat model {chat_model} já instalado")

    return success, messages


def print_model_recommendations():
    """Imprime recomendações de modelos"""
    print("🤖 MODELOS OLLAMA RECOMENDADOS")
    print("=" * 50)

    print("\n📊 MODELOS DE EMBEDDING:")
    for model, info in RECOMMENDED_EMBEDDING_MODELS.items():
        print(f"  {model}")
        print(f"    💾 Tamanho: {info['size_mb']} MB")
        print(f"    📝 Descrição: {info['description']}")
        print(f"    🎯 Uso: {info['use_case']}")
        print(f"    📏 Contexto: {info['context_length']} tokens")
        print()

    print("💬 MODELOS DE CHAT:")
    for model, info in RECOMMENDED_CHAT_MODELS.items():
        print(f"  {model}")
        print(f"    💾 Tamanho: {info['size_gb']} GB")
        print(f"    📝 Descrição: {info['description']}")
        print(f"    🎯 Uso: {info['use_case']}")
        print()


def test_ollama_setup():
    """Testa configuração do Ollama"""
    print("🧪 TESTANDO CONFIGURAÇÃO OLLAMA")
    print("=" * 40)

    manager = OllamaManager()

    # Teste 1: Ollama rodando
    if manager.is_running():
        print("✅ Ollama está rodando")
    else:
        print("❌ Ollama não está rodando")
        print("Execute: ollama serve")
        return False

    # Teste 2: Lista modelos
    models = manager.list_models()
    print(f"📦 Modelos instalados: {len(models)}")
    for model in models:
        print(f"  - {model['name']}")

    # Teste 3: Configuração atual
    config = get_ollama_config()
    print(f"\n🔧 Configuração atual:")
    print(f"  Embedding: {config['embedding_model']}")
    print(f"  Chat: {config['chat_model']}")

    # Teste 4: Modelos necessários
    embedding_installed = manager.is_model_installed(config["embedding_model"])
    chat_installed = manager.is_model_installed(config["chat_model"])

    print(f"\n📋 Status dos modelos:")
    print(
        f"  Embedding ({config['embedding_model']}): {'✅' if embedding_installed else '❌'}"
    )
    print(f"  Chat ({config['chat_model']}): {'✅' if chat_installed else '❌'}")

    if not embedding_installed or not chat_installed:
        print("\n💡 Para instalar modelos faltando:")
        if not embedding_installed:
            print(f"  ollama pull {config['embedding_model']}")
        if not chat_installed:
            print(f"  ollama pull {config['chat_model']}")

    return embedding_installed and chat_installed


if __name__ == "__main__":
    # Executar testes quando chamado diretamente
    print_model_recommendations()
    print("\n" + "=" * 50 + "\n")
    test_ollama_setup()
