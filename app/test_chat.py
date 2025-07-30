"""
Script para testar o sistema RAG completo
Testa tanto o backend quanto a funcionalidade de chat
"""

import requests
import json
import time


def test_backend():
    """Testa o backend FastAPI"""

    print("🚀 TESTANDO SISTEMA RAG COMPLETO")
    print("=" * 50)

    # URL base do backend
    base_url = "http://127.0.0.1:8000"

    # 1. Testa health check
    print("🔍 1. Testando health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 200:
            print("✅ Health check OK")
        else:
            print("❌ Health check falhou")
            return

    except Exception as e:
        print(f"❌ Erro no health check: {e}")
        return

    # 2. Testa chat
    print("\n💬 2. Testando chat...")

    perguntas = [
        "O que é inteligência artificial?",
        "Como funciona machine learning?",
        "Quais são as principais ferramentas de IA?",
    ]

    for i, pergunta in enumerate(perguntas, 1):
        print(f"\n📝 Pergunta {i}: {pergunta}")

        try:
            payload = {"question": pergunta, "max_results": 3}

            response = requests.post(
                f"{base_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                print(f"✅ Resposta recebida")
                print(f"📝 Resposta: {data.get('response', 'N/A')[:200]}...")
                print(f"📚 Fontes encontradas: {len(data.get('sources', []))}")
            else:
                print(f"❌ Erro: {response.status_code}")
                print(f"Detalhes: {response.text}")

        except Exception as e:
            print(f"❌ Erro na pergunta {i}: {e}")

    print("\n✅ Teste completo finalizado!")


if __name__ == "__main__":
    test_backend()
