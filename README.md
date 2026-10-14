🛠️ Sistema de Assistência Técnica
Sistema web para gerenciamento de Ordens de Serviço (OS) de assistência técnica.
O sistema permite cadastrar clientes e aparelhos, registrar defeitos, diagnósticos, serviços realizados, peças utilizadas, testes, valores, garantia, status e observações. Os dados são armazenados online no Supabase e o site pode ser publicado na Vercel.
🚀 Tecnologias utilizadas
- HTML5
- CSS3
- JavaScript
- Supabase
- PostgreSQL
- Git
- GitHub
- Vercel
✅ Funcionalidades
- Cadastro de nova Ordem de Serviço
- Edição de OS
- Exclusão de OS
- Visualização completa da OS
- Cadastro de cliente
- Cadastro de aparelho
- Seleção de múltiplos acessórios
- Seleção de múltiplos serviços realizados
- Registro de defeito relatado
- Diagnóstico técnico
- Registro de peças utilizadas
- Registro de testes realizados
- Valor das peças
- Mão de obra
- Desconto
- Cálculo automático do total
- Garantia
- Status da OS
- Observações
- Busca por OS, cliente, telefone, marca, modelo e IMEI
- Filtros por status, data, marca e tipo de aparelho
- Dashboard com resumo das ordens
- Faturamento cadastrado
- Impressão da OS
- Opção de salvar como PDF
- Layout responsivo para computador e celular
📁 Estrutura do projeto
assistencia-tecnica/
│
├── index.html
├── style.css
├── app.js
├── config.js
├── supabase.sql
├── vercel.json
├── README.md
└── .gitignore
index.html
Contém a estrutura visual do sistema: menu, painel, formulário, lista de ordens, filtros, detalhes e impressão.
style.css
Contém o layout, cores, responsividade, formulários, cards, botões e regras de impressão.
app.js
Contém a lógica do sistema: conexão com Supabase, cadastro, edição, exclusão, filtros, busca, cálculos, dashboard e impressão.
config.js
Contém a URL e a chave pública do Supabase.
supabase.sql
Cria a tabela ordens, ativa RLS, cria políticas e índices.
vercel.json
Configuração opcional para publicação na Vercel.
⚙️ Instalação passo a passo
1. Baixar o projeto
No GitHub, clique em:
Code → Download ZIP
Extraia a pasta em algum local do computador, por exemplo:
C:\assistencia-tecnica
2. Abrir no VS Code
Instale o Visual Studio Code e abra a pasta do projeto:
File → Open Folder
Selecione a pasta assistencia-tecnica.
3. Criar projeto no Supabase
Acesse:
https://supabase.com
Crie uma conta e depois um novo projeto.
Você precisará informar:
Nome do projeto
Senha do banco
Região
Aguarde o projeto ser criado.
4. Criar o banco de dados
No Supabase, abra:
SQL Editor → New query
Abra o arquivo supabase.sql do projeto, copie todo o conteúdo e cole no SQL Editor.
Clique em:
Run
Se tudo der certo, a tabela ordens será criada.
5. Conferir a tabela
No Supabase, abra:
Table Editor
Você deverá ver a tabela:
ordens
A estrutura principal utilizada pelo sistema é:
id
created_at

cliente_nome
cliente_documento
cliente_telefone

aparelho_tipo
aparelho_marca
aparelho_modelo
aparelho_serial
aparelho_cor
aparelho_acessorios

defeito_relatado
diagnostico

servico_realizado
pecas_utilizadas
testes_realizados

valor_pecas
valor_mao_obra
desconto
valor_total

garantia
observacoes
status
6. Obter a URL e a chave do Supabase
Dentro do projeto no Supabase, procure a área de configurações da API.
Você precisará de:
Project URL
Publishable Key
Dependendo da interface, a chave pública também pode aparecer como:
anon public
⚠️ Atenção
Pode usar no frontend:
Publishable Key
anon public
Nunca use no navegador:
service_role
Secret Key
Essas chaves têm privilégios elevados.
7. Configurar o config.js
Abra o arquivo:
config.js
Configure assim:
window.SUPABASE_CONFIG = {
  url: "SUA_URL_DO_SUPABASE",
  key: "SUA_PUBLISHABLE_KEY"
};
Exemplo:
window.SUPABASE_CONFIG = {
  url: "https://abcdefgh.supabase.co",
  key: "sb_publishable_xxxxxxxxxxxxx"
};
Salve o arquivo.
8. Conferir a ordem dos scripts
No final do index.html, a ordem deve ser:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="app.js"></script>
9. Executar localmente
Opção 1 — Live Server
No VS Code, abra index.html, clique com o botão direito e escolha:
Open with Live Server
Opção 2 — Node.js
Se tiver Node.js instalado:
npx serve .
Depois abra o endereço mostrado no terminal.
🧪 Testando a instalação
Depois que o sistema abrir:
1. Clique em Nova OS.
2. Preencha os dados do cliente.
3. Preencha os dados do aparelho.
4. Informe defeito, diagnóstico e serviço.
5. Informe os valores.
6. Clique em Salvar Ordem de Serviço.
Depois abra no Supabase:
Table Editor → ordens
Se a nova OS estiver lá, a conexão está funcionando corretamente.
🧭 Como usar o sistema
Painel
A tela inicial mostra:
Total de OS
OS abertas
OS em andamento
OS prontas
Faturamento cadastrado
Últimas ordens
Nova OS
Clique em:
Nova OS
Preencha o formulário e clique em:
Salvar Ordem de Serviço
Ordens de Serviço
Clique em:
Ordens de Serviço
A tela mostra todas as ordens cadastradas.
Abrir uma OS
Na lista, clique em:
Abrir
A tela exibirá todos os dados da ordem.
Editar uma OS
Abra uma ordem e clique em:
Editar
Faça as alterações e salve novamente.
Excluir uma OS
Abra a ordem e clique em:
Excluir
O sistema pedirá confirmação.
A exclusão é permanente.

🎒 Acessórios
O sistema pode armazenar vários acessórios ao mesmo tempo, por exemplo:
Carregador
Cabo
Fonte
Capa
Chip
Cartão de memória
Bateria
Eles podem ser salvos como:
Carregador, Cabo, Capa
🔧 Serviços realizados
Também é possível selecionar mais de um serviço:
Troca de tela
Troca de bateria
Troca de conector de carga
Troca de câmera
Troca de alto-falante
Troca de microfone
Limpeza interna
Formatação
Atualização de sistema
Reparo em placa
Solda
💰 Valores
O sistema utiliza:
Valor das peças
Mão de obra
Desconto
Total
Cálculo:
TOTAL = PEÇAS + MÃO DE OBRA - DESCONTO
Exemplo:
Peças:        R$ 150,00
Mão de obra: R$ 100,00
Desconto:    R$  20,00

Total:       R$ 230,00
📌 Status da OS
Os status padrão são:
Aberta
Em andamento
Aguardando peça
Pronta
Entregue
Cancelada
🔎 Busca e filtros
A busca pode localizar por:
Número da OS
Cliente
Telefone
Tipo de aparelho
Marca
Modelo
Serial
IMEI
Os filtros disponíveis são:
Status
Data
Marca
Tipo de aparelho
Para remover os filtros, clique em:
Limpar
🖨️ Impressão
Abra uma OS e clique em:
Imprimir
Na janela de impressão você pode escolher uma impressora ou:
Salvar como PDF
O layout está configurado para impressão compacta em aproximadamente meia folha A4 vertical.
Se necessário, desative no navegador:
Cabeçalhos e rodapés
🌐 Publicar no GitHub
1. Criar o repositório
No GitHub, clique em:
New repository
Exemplo de nome:
assistencia-tecnica
2. Inicializar o Git
Abra o terminal dentro da pasta do projeto:
git init
3. Adicionar os arquivos
git add .
4. Criar o primeiro commit
git commit -m "Projeto inicial"
5. Definir a branch principal
git branch -M main
6. Adicionar o repositório remoto
git remote add origin https://github.com/SEU-USUARIO/assistencia-tecnica.git
7. Enviar para o GitHub
git push -u origin main
🔄 Atualizar o GitHub depois
Sempre que fizer alterações:
git add .
git commit -m "Atualização do sistema"
git push
🌍 Publicar na Vercel
1. Entre em https://vercel.com.
2. Entre com sua conta do GitHub.
3. Clique em Add New → Project.
4. Selecione o repositório do sistema.
5. Clique em Deploy.
Como o projeto é HTML, CSS e JavaScript puro, normalmente não é necessário configurar build.
A Vercel criará um endereço semelhante a:
https://assistencia-tecnica.vercel.app
☁️ Como os dados ficam armazenados
A arquitetura é:
Usuário
   ↓
Vercel
   ↓
HTML / CSS / JavaScript
   ↓
Supabase
   ↓
PostgreSQL
As Ordens de Serviço ficam no Supabase, não na Vercel.
Por isso atualizar o site não deve apagar os dados do banco.
📱 Uso no celular
Abra o endereço da Vercel no navegador do celular.
No Chrome, é possível usar:
Menu → Adicionar à tela inicial
Assim o sistema pode ficar disponível como atalho na tela inicial.
🔐 Segurança
O sistema utiliza Supabase diretamente no frontend.
A Publishable Key é própria para uso no navegador, mas a segurança real depende das regras de Row Level Security (RLS).
Se as políticas do banco permitirem:
SELECT
INSERT
UPDATE
DELETE
para usuários anônimos, qualquer pessoa que consiga acessar a aplicação poderá potencialmente operar esses dados.
Para uso público real, o recomendado é adicionar:
Supabase Auth
Arquitetura recomendada para produção:
Usuário
   ↓
Login
   ↓
Supabase Auth
   ↓
RLS
   ↓
Tabela ordens
📋 Dados pessoais e LGPD
O sistema pode armazenar informações como:
Nome
Telefone
CPF
CNPJ
IMEI
Para uso comercial, esses dados devem ser tratados com cuidado e de acordo com as obrigações aplicáveis da LGPD.
🛠️ Manutenção do sistema
Alterar campos e opções
Edite:
index.html
Alterar cores e layout
Edite:
style.css
Alterar funcionamento
Edite:
app.js
Alterar conexão com Supabase
Edite:
config.js
➕ Adicionar uma nova marca
Exemplo:
<select id="aparelho_marca">
  <option value="Samsung">Samsung</option>
  <option value="Apple">Apple</option>
  <option value="Motorola">Motorola</option>
  <option value="Realme">Realme</option>
</select>
➕ Adicionar um novo status
No campo de status:
<option value="Aguardando aprovação">
  Aguardando aprovação
</option>
Se existir filtro de status, adicione a mesma opção nele.
🧰 Solução de problemas
Botões não funcionam
Pressione:
F12
Abra a aba:
Console
Procure erros em vermelho. Um único erro JavaScript pode impedir vários botões de funcionar.
Supabase não conecta
Confira o arquivo:
config.js
Verifique se a URL e a chave estão corretas.
Erro ao salvar OS
Confira no Supabase:
RLS
Policies
Também veja o Console do navegador.
Ordens não aparecem
Confira primeiro:
Supabase → Table Editor → ordens
Se os registros estiverem lá, o problema provavelmente está na interface, nos filtros ou no JavaScript.
Clique em:
Limpar
na área de filtros.
Erro supabase is not defined
Confira se este script está antes do app.js:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
Alterou o código mas nada mudou
Pressione:
Ctrl + F5
Isso recarrega a página sem usar o cache antigo.
🔄 Backup
Como os dados ficam no Supabase, é recomendado realizar backups periódicos e manter o acesso ao projeto Supabase protegido.
Também é possível exportar dados pelo painel do Supabase.
🧪 Checklist antes de publicar uma atualização
Teste sempre:
Criar OS
Abrir OS
Editar OS
Excluir OS
Buscar
Filtrar
Calcular valores
Selecionar múltiplos acessórios
Selecionar múltiplos serviços
Imprimir
Abrir no celular
📦 Instalação resumida
1. Baixar o projeto
2. Abrir no VS Code
3. Criar projeto no Supabase
4. Executar supabase.sql
5. Copiar Project URL
6. Copiar Publishable Key
7. Configurar config.js
8. Abrir com Live Server
9. Criar uma OS de teste
10. Conferir a OS no Supabase
11. Enviar para o GitHub
12. Publicar na Vercel
📌 Fluxo de uso resumido
Abrir sistema
   ↓
Nova OS
   ↓
Cadastrar cliente
   ↓
Cadastrar aparelho
   ↓
Registrar defeito
   ↓
Diagnóstico
   ↓
Registrar serviço
   ↓
Informar valores
   ↓
Salvar
   ↓
Acompanhar status
   ↓
Imprimir
   ↓
Entregar aparelho
📈 Possíveis melhorias futuras
- Login de usuários
- Supabase Auth
- Cadastro de técnicos
- Cadastro separado de clientes
- Histórico do cliente
- Histórico do aparelho
- Controle de estoque
- Cadastro de peças
- Controle de caixa
- Forma de pagamento
- Orçamentos
- Aprovação de orçamento
- Fotos do aparelho
- Assinatura digital
- PDF automático
- Envio por WhatsApp
- Notificação de aparelho pronto
- Área do cliente
- Relatórios
- Gráficos
- Exportação para Excel
- Backup automatizado
- Tema escuro
- PWA
📜 Licença
Este projeto pode ser utilizado e adaptado conforme a necessidade da assistência técnica.
Caso seja distribuído publicamente, é recomendado adicionar uma licença formal, como a MIT License.
📊 Status do projeto
Em desenvolvimento
Funcionalidades principais disponíveis:
✅ Cadastro de OS
✅ Edição
✅ Exclusão
✅ Supabase
✅ Dashboard
✅ Busca
✅ Filtros
✅ Múltiplos acessórios
✅ Múltiplos serviços
✅ Cálculo de valores
✅ Impressão
✅ Layout responsivo
✅ Publicação na Vercel
⭐ Contribuição
Para criar uma nova funcionalidade em outra branch:
git checkout -b nova-funcionalidade
Depois:
git add .
git commit -m "Adiciona nova funcionalidade"
git push origin nova-funcionalidade
🛠️ Suporte
Em caso de erro:
1. Abra o Console com F12.
2. Confira o config.js.
3. Confira a tabela ordens no Supabase.
4. Confira as políticas RLS.
5. Atualize com Ctrl + F5.
6. Confirme se os IDs do HTML são os mesmos utilizados no app.js.
Assistência Técnica
Gerenciamento simples
Dados online
Acesso de qualquer dispositivo
Supabase + Vercel
