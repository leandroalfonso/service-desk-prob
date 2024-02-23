const express = require ('express');
const app = express ();
const PORT = process.env.PORT || 3000;
const cors = require ('cors');
const axios = require ('axios');

app.use (express.json ());
app.use (cors ());

app.get ('/', (req, res) => {
  res.sendFile (__dirname + '/index.html');
});

app.get ('/detalhes', (req, res) => {
  res.sendFile (__dirname + '/detalhes.html');
});

app.get ('/lista', (req, res) => {
  res.sendFile (__dirname + '/lista.html');
});

// Rota para buscar detalhes de um item pelo ID
app.get ('/detalhes/:id', async (req, res) => {
  const id = parseInt (req.params.id);
  try {
    const response = await axios.get (
      'https://service-desk-prob.vercel.app/dados.json'
    );
    const jsonData = response.data;
    const detalhes = jsonData.find (item => item.id === id);
    if (detalhes) {
      res.json (detalhes);
    } else {
      res.status (404).json ({error: 'Item não encontrado'});
    }
  } catch (error) {
    console.error ('Erro ao buscar dados:', error);
    res.status (500).json ({error: 'Erro interno do servidor'});
  }
});

// Rota para buscar dados com base em um termo de pesquisa
app.get ('/buscar', async (req, res) => {
  const termo = req.query.searchTerm.toLowerCase ();
  try {
    const response = await axios.get (
      'https://service-desk-prob.vercel.app/dados.json'
    );
    const jsonData = response.data;
    const resultados = jsonData.filter (item => {
      return (
        item.titulo.toLowerCase ().includes (termo) ||
        item.conteudo.toLowerCase ().includes (termo) ||
        item.id.toString ().includes (termo)
      );
    });
    res.json (resultados);
  } catch (error) {
    console.error ('Erro ao buscar dados:', error);
    res.status (500).json ({error: 'Erro interno do servidor'});
  }
});

// Rota para editar o conteúdo de um post pelo ID
app.put ('/api/editar/:id', async (req, res) => {
  const id = parseInt (req.params.id);
  const novoConteudo = req.body.conteudo;
  try {
    const response = await axios.get (
      'https://service-desk-prob.vercel.app/dados.json'
    );
    let jsonData = response.data;
    const index = jsonData.findIndex (item => item.id === id);
    if (index !== -1) {
      // Atualiza o conteúdo do post
      jsonData[index].conteudo = novoConteudo;
      // Envia a requisição PUT para atualizar os dados
      await axios.put (
        `https://service-desk-prob.vercel.app/editar/${id}`,
        {conteudo: novoConteudo}
      );
      console.log (`Post ID: ${id} editado com sucesso`);
      res.send ('Edição do post realizada com sucesso');
    } else {
      res.status (404).send ('Post não encontrado');
    }
  } catch (error) {
    console.error ('Erro ao editar post:', error);
    res.status (500).send ('Erro interno do servidor');
  }
});

app.post ('/insere-json', async (req, res) => {
  const dados = req.body;
  try {
    const response = await axios.post (
      'https://service-desk-prob.vercel.app/insere-json',
      dados
    );
    console.log ('Dados inseridos com sucesso:', dados);
    res.send ('Dados inseridos com sucesso');
  } catch (error) {
    console.error ('Erro ao inserir dados:', error);
    res.status (500).send ('Erro interno do servidor');
  }
});


app.listen (PORT, () => {
  console.log (`Server is running on port ${PORT}`);
});
