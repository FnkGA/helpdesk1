
// Importa as bibliotecas necessárias
const express = require('express');
const mysql = require('mysql2/promise'); // Usamos a versão com Promises para código mais limpo
const cors = require('cors');

// Cria a aplicação Express
const app = express();
const port = 3000; // Porta em que o servidor vai rodar

// Habilita o CORS para que o frontend possa acessar esta API
app.use(cors());

// Configuração da conexão com o banco de dados MySQL
// !!! ATENÇÃO: Altere com suas credenciais do MySQL !!!
// VERSÃO NOVA (lendo das variáveis de ambiente)
const dbConfig = {
    host: process.env.DB_HOST,       // Irá ler 'db' do docker-compose.yml
    user: process.env.DB_USER,       // Irá ler 'chatbot_user'
    password: process.env.DB_PASSWORD, // Irá ler 'outra_senha_forte'
    database: process.env.DB_DATABASE  // Irá ler 'chatbot_db'
};

// Rota principal da API para buscar respostas
// Rota principal da API para buscar respostas (VERSÃO MELHORADA)
// Rota principal da API para buscar respostas (VERSÃO FINAL E ROBUSTA)
app.get('/api/search', async (req, res) => {
    const userQuery = req.query.q;

    if (!userQuery || userQuery.trim() === '') {
        return res.status(400).json({ error: 'Nenhum termo de busca fornecido.' });
    }

    try {
        // --- LÓGICA DE BUSCA FINAL ---
        // 1. Divide a pergunta do usuário em palavras.
        const allWords = userQuery.toLowerCase().split(' ');

        // 2. >>> NOVA ETAPA: Filtra as palavras, mantendo apenas as que têm 3 ou mais caracteres.
        const significantWords = allWords.filter(word => word.length >= 3);

        // 3. Verifica se sobrou alguma palavra significativa para buscar.
        if (significantWords.length === 0) {
            // Se não sobrou nenhuma palavra (ex: usuário digitou "oi" ou "a"), retorna a mensagem padrão.
            return res.json({
                response: 'Desculpe, não entendi sua pergunta. Por favor, seja um pouco mais específico.'
            });
        }

        // 4. Cria a cláusula 'LIKE' para cada palavra significativa.
        const likeClauses = significantWords.map(() => 'keywords LIKE ?').join(' OR ');
        
        // 5. Cria o array de termos de busca.
        const searchTerms = significantWords.map(word => `%${word}%`);

        // 6. Monta a query SQL final.
        const sqlQuery = `SELECT * FROM knowledge_base WHERE ${likeClauses}`;
        // --- FIM DA LÓGICA FINAL ---

        const connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute(sqlQuery, searchTerms);
        
        await connection.end();

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({
                response: 'Desculpe, não entendi sua pergunta. Tente usar outras palavras ou perguntar sobre temas como: \'carteirinha\', \'boleto\', \'biblioteca\'.'
            });
        }
    } catch (error) {
        console.error('Erro ao conectar ou buscar no banco de dados:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});
// Inicia o servidor para escutar na porta definida
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});