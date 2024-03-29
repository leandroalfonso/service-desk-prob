const express = require ('express');
const mysql = require ('mysql2/promise'); // Importa mysql2 com pool
const app = express ();
const PORT = process.env.PORT || 3000;
const cors = require ('cors');

app.use (express.json ());
app.use (cors ());

// Configuração da conexão com o banco de dados MySQL
const pool = mysql.createPool ({
  host: 'lanchonete-bd.mysql.uhserver.com',
  user: 'leandroafonso',
  password: 'Leandro171716@',
  database: 'lanchonete_bd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get ('/', (req, res) => {
  res.sendFile (__dirname + '/index.html');
});

app.get ('/lista', (req, res) => {
  res.sendFile (__dirname + '/lista.html');
});

// Rota para buscar detalhes de um item pelo ID
app.get ('/detalhes/:id', async (req, res) => {
  const id = parseInt (req.params.id);
  try {
    const connection = await pool.getConnection ();
    const [
      results,
    ] = await connection.execute (
      'SELECT * FROM problemas WHERE id_problema = ?',
      [id]
    );
    connection.release ();
    if (results.length > 0) {
      res.json (results[0]);
    } else {
      res.status (404).json ({error: 'Item não encontrado'});
    }
  } catch (err) {
    console.error ('Erro ao buscar detalhes:', err);
    res.status (500).json ({error: 'Erro interno do servidor'});
  }
});

app.get ('/buscar', async (req, res) => {
  const termo = req.query.searchTerm ? req.query.searchTerm.toLowerCase () : '';
  const opcaoBusca = req.query.opcaoBusca ? parseInt (req.query.opcaoBusca) : 0; // Convertendo para inteiro

  let query = 'SELECT * FROM problemas';

  // Verifica se há um termo de pesquisa e uma opção selecionada
  if (termo !== '' && opcaoBusca !== 0) {
    query += ` WHERE LOWER(titulo_problema) LIKE ? AND opcao = ?`;
  } else if (termo == '' && opcaoBusca !== 0) {
    query += ' WHERE opcao = ?';
  } else if (termo !== '' && opcaoBusca == 0) {
    query += ` WHERE LOWER(titulo_problema) LIKE ?`;
  }

  try {
    const connection = await pool.getConnection ();

    // Executa a consulta com os parâmetros apropriados
    let results;
    if (termo !== '' && opcaoBusca !== 0) {
      results = await connection.execute (query, [`%${termo}%`, opcaoBusca]);
    } else if (opcaoBusca !== 0) {
      results = await connection.execute (query, [opcaoBusca]);
    } else if (termo !== '' && opcaoBusca == 0) {
      results = await connection.execute (query, [`%${termo}%`]);
    } else {
      results = await connection.execute (query);
    }

    connection.release ();
    res.json (results[0]);
  } catch (err) {
    console.error ('Erro ao buscar dados:', err);
    res.status (500).json ({error: 'Erro interno do servidor'});
  }
});

// Rota para editar o conteúdo de um post pelo ID
app.put ('/editar/:id', async (req, res) => {
  const id = parseInt (req.params.id);
  const novoConteudo = req.body.conteudo;
  const novoAutor = req.body.autor;

  try {
    const connection = await pool.getConnection ();
    const [
      results,
    ] = await connection.execute (
      'UPDATE problemas SET post = ?, autor = ?, data_publicacao = NOW() WHERE id_problema = ?',
      [novoConteudo, novoAutor, id]
    );
    connection.release ();
    if (results.affectedRows > 0) {
      console.log (`Post ID: ${id} editado com sucesso`);
      res.send ('Edição do post realizada com sucesso');
    } else {
      res.status (404).send ('Post não encontrado');
    }
  } catch (err) {
    console.error ('Erro ao editar post:', err);
    res.status (500).send ('Erro interno do servidor');
  }
});

// Rota para inserir dados no banco de dados
app.post ('/insere-json', async (req, res) => {
  const dados = req.body;

  try {
    const connection = await pool.getConnection ();
    await connection.execute (
      'INSERT INTO problemas (titulo_problema, post, link, autor, opcao, data_publicacao) VALUES (?, ?, ?, ?, ?, NOW())',
      [dados.titulo, dados.conteudo, dados.link, dados.autor, dados.opcao]
    );
    connection.release ();
    console.log ('Dados inseridos com sucesso:', dados);
    res.send ('Dados inseridos com sucesso');
  } catch (err) {
    console.error ('Erro ao inserir dados:', err);
    res.status (500).send ('Erro interno do servidor');
  }
});

app.listen (PORT, () => {
  console.log (`Server is running on port ${PORT}`);
});
