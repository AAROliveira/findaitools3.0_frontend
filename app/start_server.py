"""
Script para iniciar o servidor FastAPI
Inclui verificações e configurações automáticas
"""

import os
import sys
import subprocess
import time
from pathlib import Path


def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print("🔍 Verificando dependências...")

    required = ["fastapi", "uvicorn", "llama_index", "pydantic"]

    missing = []
    for package in required:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing.append(package)

    if missing:
        print(f"\n❌ Dependências faltando: {', '.join(missing)}")
        print("Execute: pip install -r requirements.txt")
        return False

    return True


def check_embeddings():
    """Verifica se o índice de embeddings existe"""
    embeddings_path = Path("../embeddings")

    if not embeddings_path.exists():
        print("❌ Diretório de embeddings não encontrado!")
        print("Execute primeiro: python ingest/build_index.py")
        return False

    index_files = list(embeddings_path.glob("*"))
    if not index_files:
        print("❌ Índice de embeddings vazio!")
        print("Execute primeiro: python ingest/build_index.py")
        return False

    print(f"✅ Índice encontrado com {len(index_files)} arquivos")
    return True


def setup_environment():
    """Configura variáveis de ambiente"""
    env_file = Path(".env")
    env_example = Path(".env.example")

    if not env_file.exists() and env_example.exists():
        print("📝 Criando arquivo .env a partir do exemplo...")
        env_file.write_text(env_example.read_text())
        print("✅ Arquivo .env criado. Ajuste as configurações conforme necessário.")

    # Carrega variáveis do .env se existir
    if env_file.exists():
        try:
            from dotenv import load_dotenv

            load_dotenv()
            print("✅ Variáveis de ambiente carregadas")
        except ImportError:
            print("⚠️ python-dotenv não instalado. Variáveis .env não carregadas.")


def start_server():
    """Inicia o servidor uvicorn"""
    host = os.getenv("SERVER_HOST", "127.0.0.1")
    port = int(os.getenv("SERVER_PORT", "8000"))
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    workers = int(os.getenv("WORKERS", "1"))

    print(f"🚀 Iniciando servidor FastAPI...")
    print(f"📍 Host: {host}")
    print(f"🔌 Porta: {port}")
    print(f"📊 Log level: {log_level}")
    print(f"👥 Workers: {workers}")
    print("-" * 50)

    try:
        # Comando uvicorn
        cmd = [
            "uvicorn",
            "main:app",
            "--host",
            host,
            "--port",
            str(port),
            "--log-level",
            log_level,
            "--reload",  # Remove para produção
        ]

        if workers > 1:
            cmd.extend(["--workers", str(workers)])

        # Inicia o servidor
        subprocess.run(cmd, check=True)

    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
    except FileNotFoundError:
        print("❌ uvicorn não encontrado. Execute: pip install uvicorn")


def show_urls():
    """Mostra URLs úteis"""
    host = os.getenv("SERVER_HOST", "127.0.0.1")
    port = int(os.getenv("SERVER_PORT", "8000"))
    base_url = f"http://{host}:{port}"

    print(f"\n🌐 URLs do servidor:")
    print(f"📖 Documentação: {base_url}/docs")
    print(f"🔍 Health Check: {base_url}/health")
    print(f"💬 Chat Endpoint: {base_url}/chat")
    print(f"📊 Estatísticas: {base_url}/stats")


def main():
    """Função principal"""
    print("🤖 FINDAI TOOLS RAG CHATBOT")
    print("=" * 40)

    # Verificações pré-inicialização
    if not check_dependencies():
        return

    if not check_embeddings():
        return

    setup_environment()
    show_urls()

    print("\n⏳ Aguarde o servidor inicializar...")
    print("💡 Pressione Ctrl+C para parar o servidor")
    print("🧪 Para testar: python test_api.py")

    time.sleep(2)
    start_server()


if __name__ == "__main__":
    main()
