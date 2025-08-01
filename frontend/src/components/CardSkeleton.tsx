// CardSkeleton.tsx
// Componente visual para exibir o estado de carregamento dos cards de ferramentas.
// Usa animação de pulso e formas que simulam o layout real dos cards.

export default function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl border p-4 space-y-3 animate-pulse">
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
    );
}
