// Script Node.js para converter JSONL em JSON (array)
// Salve como convert-jsonl-to-json.js e execute com: node convert-jsonl-to-json.js

const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, 'src/app/api/posts/Base_wordpress_posts_publicados_29_07_2025.jsonl');
const outputPath = path.resolve(__dirname, 'src/lib/mockPosts.json');

const lines = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(Boolean);
const arr = lines.map(line => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}).filter(Boolean);

fs.writeFileSync(outputPath, JSON.stringify(arr, null, 2), 'utf-8');
console.log('Arquivo mockPosts.json gerado com sucesso:', outputPath);
