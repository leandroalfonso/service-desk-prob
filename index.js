const express = require ('express');
const fs = require ('fs');
const app = express ();
const PORT = process.env.PORT || 3000;
const cors = require ('cors');

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

app.get ('/detalhes/:id', (req, res) => {
  const id = parseInt (req.params.id);
  fs.readFile ('https://idyllic-dolphin-d890b0.netlify.app/dados.json', 'utf8', (err, data) => {
    if (err) {
      console.error ('Erro ao ler o arquivo JSON:', err);
      res.status (500).json ({error: 'Erro interno do servidor'});
      return;
    }
    try {
      const jsonData = JSON.parse (data);
      const detalhes = jsonData.find (item => item.id === id);
      if (detalhes) {
        res.json (detalhes); // Retornar os detalhes do item em formato JSON
      } else {
        res.status (404).json ({error: 'Item não encontrado'});
      }
    } catch (error) {
      console.error ('Erro ao fazer o parse do JSON:', error);
      res.status (500).json ({error: 'Erro interno do servidor'});
    }
  });
});

app.get ('/buscar/:termo', (req, res) => {
  const termo = req.params.termo.toLowerCase ();
  fs.readFile ('https://idyllic-dolphin-d890b0.netlify.app/dados.json', 'utf8', (err, data) => {
    if (err) {
      console.error ('Erro ao ler o arquivo JSON:', err);
      res.status (500).json ({error: 'Erro interno do servidor'});
      return;
    }
    try {
      const jsonData = JSON.parse (data);
      const resultados = jsonData.filter (item => {
        return (
          item.titulo.toLowerCase ().includes (termo) ||
          item.conteudo.toLowerCase ().includes (termo) ||
          item.id.toString ().includes (termo)
        );
      });
      res.json (resultados);
    } catch (error) {
      console.error ('Erro ao fazer o parse do JSON:', error);
      res.status (500).json ({error: 'Erro interno do servidor'});
    }
  });
});

app.put ('/editar/:id', (req, res) => {
  const id = parseInt (req.params.id);
  const novoConteudo = req.body.conteudo;

  fs.readFile ('https://idyllic-dolphin-d890b0.netlify.app/dados.json', 'utf8', (err, data) => {
    if (err) {
      console.error ('Erro ao ler o arquivo JSON:', err);
      res.status (500).send ('Erro interno do servidor');
      return;
    }
    try {
      let jsonData = JSON.parse (data);
      const index = jsonData.findIndex (item => item.id === id);
      if (index !== -1) {
        // Atualiza o conteúdo do post
        jsonData[index].conteudo = novoConteudo;
        // Escreve de volta no arquivo
        fs.writeFile ('dados.json', JSON.stringify (jsonData), err => {
          if (err) {
            console.error ('Erro ao escrever no arquivo JSON:', err);
            res.status (500).send ('Erro interno do servidor');
            return;
          }
          console.log (`Post ID: ${id} editado com sucesso`);
          res.send ('Edição do post realizada com sucesso');
        });
      } else {
        res.status (404).send ('Post não encontrado');
      }
    } catch (error) {
      console.error ('Erro ao fazer o parse do JSON:', error);
      res.status (500).send ('Erro interno do servidor');
    }
  });
});

app.post ('/insere-json', (req, res) => {
  const dados = req.body;
  fs.readFile ('https://idyllic-dolphin-d890b0.netlify.app/dados.json', 'utf8', (err, data) => {
    if (err) {
      console.error ('Erro ao ler o arquivo JSON:', err);
      res.status (500).send ('Erro interno do servidor');
      return;
    }
    let jsonContent = [];
    if (data) {
      try {
        jsonContent = JSON.parse (data);
      } catch (error) {
        console.error ('Erro ao analisar o conteúdo JSON:', error);
        res.status (500).send ('Erro interno do servidor');
        return;
      }
    }
    jsonContent.push (dados);
    fs.writeFile ('https://idyllic-dolphin-d890b0.netlify.app/dados.json', JSON.stringify (jsonContent), err => {
      if (err) {
        console.error ('Erro ao escrever no arquivo JSON:', err);
        res.status (500).send ('Erro interno do servidor');
        return;
      }
      console.log ('Dados inseridos com sucesso:', dados);
      res.send ('Dados inseridos com sucesso');
    });
  });
});

app.listen (PORT, () => {
  console.log (`Server is running on port ${PORT}`);
});
