"""
Script para executar o servidor FastAPI
Usa o caminho correto do ambiente virtual
"""

import subprocess
import sys
import os
from pathlib import Path


def main():
    """Executa o servidor FastAPI com o ambiente virtual correto"""

    # Caminho para o Python do ambiente virtual
    project_root = Path(__file__).parent.parent
    python_exe = project_root / ".venv" / "Scripts" / "python.exe"

    if not python_exe.exists():
        print(f"❌ Python do ambiente virtual não encontrado: {python_exe}")
        return 1

    # Muda para o diretório do app
    app_dir = Path(__file__).parent
    os.chdir(app_dir)

    print("🚀 Iniciando servidor FastAPI...")
    print(f"📁 Diretório: {app_dir}")
    print(f"🐍 Python: {python_exe}")
    print("🌐 URL: http://127.0.0.1:8000")
    print("📖 Docs: http://127.0.0.1:8000/docs")
    print("-" * 50)

    # Comando para executar o servidor
    cmd = [
        str(python_exe),
        "-m",
        "uvicorn",
        "main:app",
        "--reload",
        "--port",
        "8000",
        "--host",
        "127.0.0.1",
    ]

    try:
        # Executa o servidor
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n⏹️  Servidor parado pelo usuário")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar servidor: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
