CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome TEXT NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL
);

CREATE TABLE produto (
  id_produto SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  marca TEXT NOT NULL,
  quantidade_minima INTEGER NOT NULL
);

CREATE TABLE lote (
  id_lote SERIAL PRIMARY KEY,
  id_produto INTEGER NOT NULL,
  numero_lote TEXT NOT NULL,
  data_validade DATE NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE movimentacao (
  id_movimentacao SERIAL PRIMARY KEY,
  id_lote INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  tipo_movimentacao TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  data_movimentacao DATE NOT NULL,
  FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

INSERT INTO usuario (nome, email, senha) VALUES
('Admin', 'admin@horizon.com', '123');

INSERT INTO produto (nome, categoria, marca, quantidade_minima) VALUES
('Perfume A', 'Perfume', 'Marca X', 10);

INSERT INTO lote (id_produto, numero_lote, data_validade, quantidade_atual) VALUES
(1, 'L001', '2026-12-31', 50);

INSERT INTO movimentacao (id_lote, id_usuario, tipo_movimentacao, quantidade, data_movimentacao) VALUES
(1, 1, 'entrada', 50, '2026-04-01');

SELECT
    u.id_usuario,
    u.nome AS nome_usuario,
    u.email,
    u.senha,
    p.nome AS nome_produto,
    p.categoria,
    p.marca,
    p.quantidade_minima,
    l.id_produto,
    l.numero_lote,
    l.data_validade,
    m.id_lote,
    m.tipo_movimentacao,
    m.quantidade,
    m.data_movimentacao
FROM movimentacao m
JOIN lote l ON m.id_lote = l.id_lote
JOIN produto p ON l.id_produto = p.id_produto
JOIN usuario u ON m.id_usuario = u.id_usuario;