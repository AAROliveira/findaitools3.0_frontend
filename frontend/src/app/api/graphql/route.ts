import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { query, variables } = await request.json();
  const apiUrl = process.env.WORDPRESS_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { error: 'A API do WordPress não está configurada no servidor.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // A revalidação pode ser controlada aqui se necessário
      next: { revalidate: 10 }, 
    });

    if (!response.ok) {
      console.error("Erro na resposta do WordPress:", response.statusText);
      return NextResponse.json(
        { error: `Erro ao comunicar com o WordPress: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro no proxy da API GraphQL:", error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor ao fazer o proxy do pedido.' },
      { status: 500 }
    );
  }
}
