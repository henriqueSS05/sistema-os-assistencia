# Assistência Técnica com Supabase

Este projeto não usa SQLite e não precisa de `server.js`.

## Arquivos

- index.html
- style.css
- app.js
- config.js
- supabase.sql
- vercel.json

## 1. Criar a tabela

No Supabase:

1. Abra seu projeto.
2. Vá em **SQL Editor**.
3. Abra o arquivo `supabase.sql`.
4. Copie todo o conteúdo.
5. Clique em **Run**.

## 2. Configurar o projeto

No Supabase, procure sua:

- Project URL
- Publishable key ou anon key

Abra `config.js` e coloque:

```js
window.SUPABASE_CONFIG = {
  url: "https://SEU-PROJETO.supabase.co",
  key: "SUA_CHAVE_PUBLICA"
};
```

Nunca coloque `service_role` ou uma secret key em `config.js`.

## 3. Testar no VS Code

Você pode usar a extensão **Live Server**.

Clique com o botão direito no `index.html` e escolha:

`Open with Live Server`

Outra opção:

```bash
npx serve .
```

## 4. Publicar na Vercel

Esse projeto é estático.

Você pode subir diretamente para a Vercel.

Não precisa de:

- npm install
- Node no servidor
- SQLite
- better-sqlite3
- server.js

## 5. Importante sobre segurança

As políticas do `supabase.sql` permitem leitura, criação, edição e exclusão usando a chave pública.

Isso é adequado para teste inicial.

Antes de deixar o site público, é melhor adicionar login com Supabase Auth e restringir as políticas.

## 6. Impressão

A tela de detalhes tem botão **Imprimir**.

O CSS está configurado para impressão compacta em aproximadamente meia folha A4 vertical.
