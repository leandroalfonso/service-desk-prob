const express = require ('express');
const mysql = require ('mysql');
const app = express ();
const PORT = process.env.PORT || 3000;
const cors = require ('cors');

app.use (express.json ());
app.use (cors ());

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection ({
  host: 'lanchonete-bd.mysql.uhserver.com',
  user: 'leandroafonso',
  password: 'Leandro171716@',
  database: 'lanchonete_bd',
});

// Conecta-se ao banco de dados
connection.connect (err => {
  if (err) {
    console.error ('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log ('Conexão bem-sucedida com o banco de dados MySQL');
});

app.get ('/', (req, res) => {
  res.sendFile (__dirname + '/index.html');
});

app.get ('/lista', (req, res) => {
  res.sendFile (__dirname + '/lista.html');
});

// Rota para buscar detalhes de um item pelo ID
app.get ('/detalhes/:id', (req, res) => {
  const id = parseInt (req.params.id);
  // Consulta SQL para selecionar o item com o ID especificado
  const sql = 'SELECT * FROM problemas WHERE id_problema = ?';
  connection.query (sql, [id], (err, results) => {
    if (err) {
      console.error ('Erro ao buscar detalhes:', err);
      res.status (500).json ({error: 'Erro interno do servidor'});
      return;
    }
    if (results.length > 0) {
      res.json (results[0]);
    } else {
      res.status (404).json ({error: 'Item não encontrado'});
    }
  });
});

// Rota para buscar dados com base em um termo de pesquisa
app.get ('/buscar', (req, res) => {
  const termo = req.query.searchTerm ? req.query.searchTerm.toLowerCase () : '';

  // Consulta SQL para selecionar itens que correspondam ao termo de pesquisa
  const sql =
    'SELECT * FROM problemas WHERE LOWER(titulo_problema) LIKE ? OR LOWER(post) LIKE ?';
  const searchTerm = `%${termo}%`;
  connection.query (sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error ('Erro ao buscar dados:', err);
      res.status (500).json ({error: 'Erro interno do servidor'});
      return;
    }
    res.json (results);
  });
});

// Rota para editar o conteúdo de um post pelo ID
app.put ('/editar/:id', (req, res) => {
  const id = parseInt (req.params.id);
  const novoConteudo = req.body.conteudo;
  const novoAutor = req.body.autor; // Corrigido para novoAutor

  // Consulta SQL para atualizar o conteúdo do post com o ID especificado
  const sql = 'UPDATE problemas SET post = ?, autor = ?, data_publicacao = NOW() WHERE id_problema = ?'; // Atualizado para incluir o novo autor
  connection.query (sql, [novoConteudo, novoAutor, id], (err, results) => {
    // Corrigido para incluir novoAutor
    if (err) {
      console.error ('Erro ao editar post:', err);
      res.status (500).send ('Erro interno do servidor');
      return;
    }
    if (results.affectedRows > 0) {
      console.log (`Post ID: ${id} editado com sucesso`);
      res.send ('Edição do post realizada com sucesso');
    } else {
      res.status (404).send ('Post não encontrado');
    }
  });
});

// Rota para inserir dados no banco de dados
app.post ('/insere-json', (req, res) => {
  const dados = req.body;
  // Consulta SQL para inserir os dados na tabela
  const sql =
    'INSERT INTO problemas (titulo_problema, post, link, autor, data_publicacao) VALUES (?, ?, ?, ?, NOW())';
  const values = [dados.titulo, dados.conteudo, dados.link, dados.autor];
  connection.query (sql, values, (err, results) => {
    if (err) {
      console.error ('Erro ao inserir dados:', err);
      res.status (500).send ('Erro interno do servidor');
      return;
    }
    console.log ('Dados inseridos com sucesso:', dados);
    res.send ('Dados inseridos com sucesso');
  });
});

app.listen (PORT, () => {
  console.log (`Server is running on port ${PORT}`);
});
