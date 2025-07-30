import numpy as np
import pickle
import os
from app.llm_config import get_embedding, generate_response

PERSIST_DIR = os.path.join(os.path.dirname(__file__), '../embeddings')
EMBEDDINGS_PATH = os.path.join(PERSIST_DIR, 'embeddings.npy')
TEXTS_PATH = os.path.join(PERSIST_DIR, 'texts.pkl')

class LocalSemanticSearch:
    def __init__(self, embeddings_path=EMBEDDINGS_PATH, texts_path=TEXTS_PATH):
        self.embeddings = np.load(embeddings_path)
        with open(texts_path, 'rb') as f:
            self.texts = pickle.load(f)

    def search(self, query, top_k=5):
        query_emb = np.array(get_embedding(query))
        # Normaliza para evitar problemas de escala
        def norm(x):
            return x / (np.linalg.norm(x) + 1e-8)
        query_emb = norm(query_emb)
        doc_embs = np.array([norm(e) for e in self.embeddings])
        sims = np.dot(doc_embs, query_emb)
        top_idx = np.argsort(sims)[::-1][:top_k]
        results = [
            {
                'content': self.texts[i],
                'score': float(sims[i])
            }
            for i in top_idx
        ]
        return results
