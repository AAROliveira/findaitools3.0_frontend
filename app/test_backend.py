"""
TESTE SIMPLES - Backend RAG
Versão mínima para verificar se tudo funciona
"""

import sys
import os

print("🔍 DIAGNÓSTICO DO BACKEND")
print("=" * 40)

# Teste 1: Python
print(f"✅ Python: {sys.version}")

# Teste 2: Diretório
print(f"✅ Diretório: {os.getcwd()}")

# Teste 3: Dependências básicas
try:
    import fastapi

    print(f"✅ FastAPI: {fastapi.__version__}")
except ImportError:
    print("❌ FastAPI não instalado")
    print("Execute: pip install fastapi")

try:
    import uvicorn

    print(f"✅ Uvicorn: {uvicorn.__version__}")
except ImportError:
    print("❌ Uvicorn não instalado")
    print("Execute: pip install uvicorn")

# Teste 4: Servidor básico
print("\n🚀 CRIANDO SERVIDOR BÁSICO...")

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(title="RAG Chatbot - Teste")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def test_root():
        return {"status": "OK", "message": "Backend funcionando!"}

    @app.get("/health")
    def test_health():
        return {"status": "healthy", "backend": "online"}

    @app.post("/chat")
    def test_chat(data: dict):
        return {
            "response": f"Echo: {data.get('question', 'Nenhuma pergunta')}",
            "status": "test_mode",
        }

    print("✅ Servidor básico criado com sucesso!")
    print("\n🌐 Para testar:")
    print("uvicorn test_backend:app --reload --port 8000")
    print("Acesse: http://localhost:8000")

except Exception as e:
    print(f"❌ Erro ao criar servidor: {e}")

print("\n" + "=" * 40)
print("✅ DIAGNÓSTICO CONCLUÍDO")
