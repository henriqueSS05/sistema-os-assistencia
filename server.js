const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const dbDir = path.join(__dirname, 'database');
fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(path.join(dbDir, 'assistencia.db'));

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS ordens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_abertura TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_documento TEXT,
  cliente_telefone TEXT,
  aparelho_tipo TEXT,
  aparelho_marca TEXT,
  aparelho_modelo TEXT,
  aparelho_serial TEXT,
  aparelho_cor TEXT,
  aparelho_acessorios TEXT,
  defeito_relatado TEXT,
  diagnostico TEXT,
  servico_realizado TEXT,
  pecas_utilizadas TEXT,
  testes_realizados TEXT,
  valor_pecas REAL DEFAULT 0,
  valor_mao_obra REAL DEFAULT 0,
  desconto REAL DEFAULT 0,
  valor_total REAL DEFAULT 0,
  garantia TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'Aberta',
  atualizado_em TEXT
)
`);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function nowBR() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function num(v) {
  const n = Number(String(v ?? 0).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

app.get('/api/dashboard', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM ordens').get().c;
  const abertas = db.prepare("SELECT COUNT(*) AS c FROM ordens WHERE status = 'Aberta'").get().c;
  const andamento = db.prepare("SELECT COUNT(*) AS c FROM ordens WHERE status = 'Em andamento'").get().c;
  const prontas = db.prepare("SELECT COUNT(*) AS c FROM ordens WHERE status = 'Pronta'").get().c;
  const faturamento = db.prepare('SELECT COALESCE(SUM(valor_total),0) AS total FROM ordens').get().total;
  const recentes = db.prepare(`
    SELECT id, cliente_nome, aparelho_marca, aparelho_modelo, status, valor_total, data_abertura
    FROM ordens ORDER BY id DESC LIMIT 5
  `).all();
  res.json({ total, abertas, andamento, prontas, faturamento, recentes });
});

app.get('/api/ordens', (req, res) => {
  const termo = String(req.query.q || '').trim();
  if (!termo) {
    return res.json(db.prepare('SELECT * FROM ordens ORDER BY id DESC').all());
  }
  const like = `%${termo}%`;
  const rows = db.prepare(`
    SELECT * FROM ordens
    WHERE CAST(id AS TEXT) LIKE ?
       OR cliente_nome LIKE ?
       OR cliente_telefone LIKE ?
       OR aparelho_marca LIKE ?
       OR aparelho_modelo LIKE ?
       OR aparelho_serial LIKE ?
    ORDER BY id DESC
  `).all(like, like, like, like, like, like);
  res.json(rows);
});

app.get('/api/ordens/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ordens WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'OS não encontrada' });
  res.json(row);
});

app.post('/api/ordens', (req, res) => {
  const b = req.body;
  if (!String(b.cliente_nome || '').trim()) {
    return res.status(400).json({ error: 'Informe o nome do cliente.' });
  }

  const valorPecas = num(b.valor_pecas);
  const valorMao = num(b.valor_mao_obra);
  const desconto = num(b.desconto);
  const total = Math.max(0, valorPecas + valorMao - desconto);

  const info = db.prepare(`
    INSERT INTO ordens (
      data_abertura, cliente_nome, cliente_documento, cliente_telefone,
      aparelho_tipo, aparelho_marca, aparelho_modelo, aparelho_serial,
      aparelho_cor, aparelho_acessorios, defeito_relatado, diagnostico,
      servico_realizado, pecas_utilizadas, testes_realizados,
      valor_pecas, valor_mao_obra, desconto, valor_total,
      garantia, observacoes, status, atualizado_em
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    nowBR(),
    b.cliente_nome || '', b.cliente_documento || '', b.cliente_telefone || '',
    b.aparelho_tipo || '', b.aparelho_marca || '', b.aparelho_modelo || '', b.aparelho_serial || '',
    b.aparelho_cor || '', b.aparelho_acessorios || '', b.defeito_relatado || '', b.diagnostico || '',
    b.servico_realizado || '', b.pecas_utilizadas || '', b.testes_realizados || '',
    valorPecas, valorMao, desconto, total,
    b.garantia || '', b.observacoes || '', b.status || 'Aberta', nowBR()
  );

  res.status(201).json({ id: info.lastInsertRowid, valor_total: total });
});

app.put('/api/ordens/:id', (req, res) => {
  const b = req.body;
  const exists = db.prepare('SELECT id FROM ordens WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'OS não encontrada' });
  if (!String(b.cliente_nome || '').trim()) {
    return res.status(400).json({ error: 'Informe o nome do cliente.' });
  }

  const valorPecas = num(b.valor_pecas);
  const valorMao = num(b.valor_mao_obra);
  const desconto = num(b.desconto);
  const total = Math.max(0, valorPecas + valorMao - desconto);

  db.prepare(`
    UPDATE ordens SET
      cliente_nome=?, cliente_documento=?, cliente_telefone=?,
      aparelho_tipo=?, aparelho_marca=?, aparelho_modelo=?, aparelho_serial=?,
      aparelho_cor=?, aparelho_acessorios=?, defeito_relatado=?, diagnostico=?,
      servico_realizado=?, pecas_utilizadas=?, testes_realizados=?,
      valor_pecas=?, valor_mao_obra=?, desconto=?, valor_total=?,
      garantia=?, observacoes=?, status=?, atualizado_em=?
    WHERE id=?
  `).run(
    b.cliente_nome || '', b.cliente_documento || '', b.cliente_telefone || '',
    b.aparelho_tipo || '', b.aparelho_marca || '', b.aparelho_modelo || '', b.aparelho_serial || '',
    b.aparelho_cor || '', b.aparelho_acessorios || '', b.defeito_relatado || '', b.diagnostico || '',
    b.servico_realizado || '', b.pecas_utilizadas || '', b.testes_realizados || '',
    valorPecas, valorMao, desconto, total,
    b.garantia || '', b.observacoes || '', b.status || 'Aberta', nowBR(), req.params.id
  );

  res.json({ ok: true, valor_total: total });
});

app.patch('/api/ordens/:id/status', (req, res) => {
  const result = db.prepare('UPDATE ordens SET status=?, atualizado_em=? WHERE id=?')
    .run(req.body.status || 'Aberta', nowBR(), req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'OS não encontrada' });
  res.json({ ok: true });
});

app.delete('/api/ordens/:id', (req, res) => {
  const result = db.prepare('DELETE FROM ordens WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'OS não encontrada' });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Assistência Técnica rodando em http://localhost:${PORT}`);
});
