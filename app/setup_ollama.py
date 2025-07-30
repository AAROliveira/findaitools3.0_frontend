"""
Script para configurar Ollama automaticamente
Instala modelos recomendados e testa a configuração
"""

import os
import sys
import subprocess
import time
from pathlib import Path

# Adiciona o diretório do app ao path
sys.path.append(str(Path(__file__).parent))

try:
    from ollama_config import (
        OllamaManager,
        setup_ollama_models,
        print_model_recommendations,
        test_ollama_setup,
    )
except ImportError:
    print(
        "❌ Erro ao importar ollama_config. Certifique-se que está no diretório correto."
    )
    sys.exit(1)


def check_ollama_installation():
    """Verifica se o Ollama está instalado"""
    try:
        result = subprocess.run(
            ["ollama", "--version"], capture_output=True, text=True, check=True
        )
        print(f"✅ Ollama instalado: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Ollama não encontrado")
        return False


def install_ollama_instructions():
    """Mostra instruções para instalar o Ollama"""
    print("\n📥 INSTRUÇÕES PARA INSTALAR OLLAMA")
    print("=" * 40)
    print("1. Windows:")
    print("   - Baixe de: https://ollama.ai/download")
    print("   - Execute o instalador")
    print("   - Reinicie o terminal")
    print()
    print("2. Linux/Mac:")
    print("   curl -fsSL https://ollama.ai/install.sh | sh")
    print()
    print("3. Após instalação, execute:")
    print("   ollama serve")


def start_ollama_service():
    """Tenta iniciar o serviço Ollama"""
    print("🚀 Tentando iniciar serviço Ollama...")

    try:
        # Tenta iniciar em background
        if os.name == "nt":  # Windows
            subprocess.Popen(
                ["ollama", "serve"], creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:  # Linux/Mac
            subprocess.Popen(
                ["ollama", "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

        print("⏳ Aguardando serviço inicializar...")
        time.sleep(5)

        # Verifica se está rodando
        manager = OllamaManager()
        if manager.is_running():
            print("✅ Serviço Ollama iniciado com sucesso!")
            return True
        else:
            print("❌ Falha ao iniciar serviço automaticamente")
            return False

    except Exception as e:
        print(f"❌ Erro ao iniciar serviço: {e}")
        return False


def setup_recommended_models():
    """Configura modelos recomendados"""
    print("\n🤖 CONFIGURANDO MODELOS RECOMENDADOS")
    print("=" * 45)

    manager = OllamaManager()

    if not manager.is_running():
        print("❌ Ollama não está rodando")
        if not start_ollama_service():
            print("Execute manualmente: ollama serve")
            return False

    print("📋 Modelos que serão instalados:")
    print("  - nomic-embed-text (embedding, ~274MB)")
    print("  - deepseek-r1:1.5b (chat, ~1GB)")
    print()

    response = input("Continuar com a instalação? (s/N): ").lower()
    if response not in ["s", "sim", "y", "yes"]:
        print("⏹️ Instalação cancelada")
        return False

    success, messages = setup_ollama_models(manager)

    print("\n📊 RESULTADO DA CONFIGURAÇÃO:")
    for message in messages:
        print(f"  {message}")

    if success:
        print("\n✅ Configuração concluída com sucesso!")
        return True
    else:
        print("\n❌ Algumas configurações falharam")
        return False


def test_full_setup():
    """Testa configuração completa"""
    print("\n🧪 TESTANDO CONFIGURAÇÃO COMPLETA")
    print("=" * 40)

    # Teste básico
    if not test_ollama_setup():
        return False

    # Teste de embedding
    print("\n🔍 Testando geração de embedding...")
    manager = OllamaManager()

    test_text = "Este é um teste de embedding"
    embedding = manager.generate_embedding(test_text, "nomic-embed-text")

    if embedding:
        print(f"✅ Embedding gerado: {len(embedding)} dimensões")
    else:
        print("❌ Falha na geração de embedding")
        return False

    # Teste de chat
    print("\n💬 Testando geração de resposta...")
    test_prompt = "Olá! Responda brevemente: o que é inteligência artificial?"
    response = manager.generate_response(test_prompt, "deepseek-r1:1.5b")

    if response:
        print(f"✅ Resposta gerada: {response[:100]}...")
    else:
        print("❌ Falha na geração de resposta")
        return False

    print("\n🎉 Todos os testes passaram!")
    return True


def create_ollama_env():
    """Cria arquivo .env com configurações do Ollama"""
    env_file = Path(".env")

    ollama_config = """
# Configurações do Ollama
USE_OLLAMA=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=deepseek-r1:1.5b

# Desabilita OpenAI quando usando Ollama
USE_LOCAL_LLM=true
# OPENAI_API_KEY=
"""

    if env_file.exists():
        content = env_file.read_text()
        if "USE_OLLAMA" not in content:
            # Adiciona configurações do Ollama ao .env existente
            with open(env_file, "a") as f:
                f.write(ollama_config)
            print("✅ Configurações Ollama adicionadas ao .env")
    else:
        # Cria novo .env
        env_file.write_text(ollama_config.strip())
        print("✅ Arquivo .env criado com configurações Ollama")


def main():
    """Função principal"""
    print("🤖 CONFIGURADOR AUTOMÁTICO DO OLLAMA")
    print("FindAI Tools RAG Chatbot")
    print("=" * 50)

    # Passo 1: Verificar instalação
    if not check_ollama_installation():
        install_ollama_instructions()
        return False

    # Passo 2: Mostrar modelos recomendados
    print_model_recommendations()

    # Passo 3: Configurar modelos
    if not setup_recommended_models():
        return False

    # Passo 4: Testar configuração
    if not test_full_setup():
        return False

    # Passo 5: Criar configurações
    create_ollama_env()

    # Resultado final
    print("\n" + "=" * 50)
    print("🎉 CONFIGURAÇÃO OLLAMA CONCLUÍDA!")
    print("=" * 50)
    print("✅ Modelos instalados e testados")
    print("✅ Configurações criadas")
    print()
    print("📋 Próximos passos:")
    print("1. Execute o pipeline: python ../ingest/pipeline_complete.py")
    print("2. Inicie o servidor: python start_server.py")
    print("3. Teste a API: python test_api.py")
    print()
    print("💡 O sistema agora usa Ollama localmente!")

    return True


if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Configuração não foi concluída")
        print("Verifique os logs acima e tente novamente")
        sys.exit(1)
