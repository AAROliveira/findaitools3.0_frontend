"""
Script de teste para o backend FastAPI
Testa os endpoints e funcionalidades básicas
"""

import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"


def test_health():
    """Testa o endpoint de health check"""
    print("🔍 Testando health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            print(f"✅ Índice carregado: {data['index_loaded']}")
            return data["index_loaded"]
        else:
            print(f"❌ Health check falhou: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Servidor não está rodando. Execute: python app/main.py")
        return False
    except Exception as e:
        print(f"❌ Erro no health check: {e}")
        return False


def test_root():
    """Testa o endpoint raiz"""
    print("\n🔍 Testando endpoint raiz...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resposta: {data['message']}")
            return True
        else:
            print(f"❌ Endpoint raiz falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no endpoint raiz: {e}")
        return False


def test_chat(question: str):
    """Testa o endpoint de chat"""
    print(f"\n🔍 Testando chat com pergunta: '{question}'")
    try:
        payload = {"question": question, "max_results": 3}

        response = requests.post(
            f"{BASE_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resposta recebida:")
            print(f"📝 Texto: {data['response'][:200]}...")
            print(f"📊 Fontes: {data['metadata']['sources_count']}")
            print(f"📈 Comprimento: {data['metadata']['response_length']} caracteres")
            return True
        else:
            print(f"❌ Chat falhou: {response.status_code}")
            print(f"❌ Erro: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro no chat: {e}")
        return False


def test_stats():
    """Testa o endpoint de estatísticas"""
    print("\n🔍 Testando estatísticas...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Estatísticas:")
            for key, value in data.items():
                print(f"  📊 {key}: {value}")
            return True
        else:
            print(f"❌ Stats falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro nas stats: {e}")
        return False


def run_full_test():
    """Executa todos os testes"""
    print("🧪 INICIANDO TESTES DO BACKEND")
    print("=" * 50)

    tests_passed = 0
    total_tests = 0

    # Teste 1: Health Check
    total_tests += 1
    if test_health():
        tests_passed += 1

    # Teste 2: Root endpoint
    total_tests += 1
    if test_root():
        tests_passed += 1

    # Teste 3: Stats
    total_tests += 1
    if test_stats():
        tests_passed += 1

    # Teste 4: Chat com pergunta simples
    total_tests += 1
    if test_chat("O que são ferramentas de IA?"):
        tests_passed += 1

    # Teste 5: Chat com pergunta específica
    total_tests += 1
    if test_chat("Quais são as principais características do ChatGPT?"):
        tests_passed += 1

    # Resultado final
    print("\n" + "=" * 50)
    print(f"🏁 RESULTADO DOS TESTES")
    print(f"✅ Passou: {tests_passed}/{total_tests}")
    print(f"❌ Falhou: {total_tests - tests_passed}/{total_tests}")

    if tests_passed == total_tests:
        print("🎉 Todos os testes passaram! Backend funcionando perfeitamente.")
        return True
    else:
        print("⚠️ Alguns testes falharam. Verifique a configuração.")
        return False


def interactive_chat():
    """Chat interativo para testes manuais"""
    print("\n💬 MODO CHAT INTERATIVO")
    print("Digite suas perguntas (ou 'quit' para sair)")
    print("-" * 40)

    while True:
        try:
            question = input("\n❓ Sua pergunta: ").strip()

            if question.lower() in ["quit", "exit", "sair"]:
                print("👋 Chat finalizado!")
                break

            if not question:
                continue

            # Mostra timestamp
            timestamp = time.strftime("%H:%M:%S")
            print(f"[{timestamp}] Processando...")

            # Faz a pergunta
            start_time = time.time()
            success = test_chat(question)
            end_time = time.time()

            if success:
                print(f"⏱️ Tempo de resposta: {end_time - start_time:.2f}s")

        except KeyboardInterrupt:
            print("\n👋 Chat interrompido!")
            break
        except Exception as e:
            print(f"❌ Erro: {e}")


def main():
    """Função principal"""
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        # Modo interativo
        if test_health():
            interactive_chat()
        else:
            print(
                "❌ Servidor não está funcionando. Execute primeiro: python app/main.py"
            )
    else:
        # Modo de testes automáticos
        run_full_test()


if __name__ == "__main__":
    main()
