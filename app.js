const cfg = window.SUPABASE_CONFIG || {};

if (!cfg.url || !cfg.key || cfg.url.includes("COLE_AQUI")) {
  alert("Configure o Supabase no arquivo config.js antes de usar o sistema.");
}

const supabaseClient = supabase.createClient(cfg.url, cfg.key);

let detalheAtual = null;
let todasOrdens = [];

/* ---------- TESTES RÁPIDOS ---------- */
// Para incluir ou tirar itens, edite esta lista.
const TESTES_ITENS = [
  "Tela",
  "Touch",
  "Câmera",
  "Alto-falante",
  "Microfone",
  "Carregamento",
  "Wi-Fi",
  "Bluetooth",
  "Chip / Sinal",
  "Botões"
];

let testesRapidos = {};

function renderTestesRapidos() {
  $("testes-rapidos").innerHTML = TESTES_ITENS.map(nome => {
    const v = testesRapidos[nome] || "";

    return `
      <div class="teste-row">
        <span class="teste-nome">${esc(nome)}</span>

        <div class="seg">
          <button type="button" class="seg-btn ok ${v === "OK" ? "on" : ""}"
            data-t="${esc(nome)}" data-v="OK">OK</button>

          <button type="button" class="seg-btn falha ${v === "Falha" ? "on" : ""}"
            data-t="${esc(nome)}" data-v="Falha">Falha</button>
        </div>
      </div>
    `;
  }).join("");
}

function montarTestes() {
  const linhas = TESTES_ITENS
    .filter(n => testesRapidos[n])
    .map(n => `${n}: ${testesRapidos[n]}`);

  const livre = $("testes_realizados").value.trim();

  return [linhas.join("\n"), livre]
    .filter(Boolean)
    .join("\n\n");
}

function carregarTestes(texto) {
  testesRapidos = {};

  const resto = [];

  String(texto || "").split("\n").forEach(linha => {
    const m = linha.match(/^(.+): (OK|Falha)$/);

    if (m && TESTES_ITENS.includes(m[1])) {
      testesRapidos[m[1]] = m[2];
    } else {
      resto.push(linha);
    }
  });

  $("testes_realizados").value = resto.join("\n").trim();

  renderTestesRapidos();
}

function testesHTML(texto) {
  const itens = [];
  const resto = [];

  String(texto || "").split("\n").forEach(linha => {
    const m = linha.match(/^(.+): (OK|Falha)$/);

    if (m && TESTES_ITENS.includes(m[1])) {
      itens.push(m);
    } else if (linha.trim()) {
      resto.push(linha.trim());
    }
  });

  if (!itens.length && !resto.length) {
    return "<p>-</p>";
  }

  const chips = itens.length
    ? `<div class="teste-chips">${itens.map(m => `
        <span class="teste-chip ${m[2] === "OK" ? "ok" : "falha"}">
          ${esc(m[1])}: ${m[2]}
        </span>`).join("")}</div>`
    : "";

  const extra = resto.length
    ? `<p>${resto.map(esc).join("<br>")}</p>`
    : "";

  return chips + extra;
}

/* ---------- FOTOS ---------- */
const BUCKET_FOTOS = "fotos-os";
const MAX_FOTOS = 8;

// itens: { existente: true, path, url } | { existente: false, file, preview }
let fotosForm = [];
let fotosRemovidas = [];
let salvando = false;

async function comprimirImagem(file, maxLado = 1600, qualidade = 0.82) {
  let bmp;

  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (e) {
    return null;
  }

  const escala = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");

  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(blob), "image/jpeg", qualidade)
  );
}

function renderFotosForm() {
  const grid = $("fotos-previa");

  grid.innerHTML = fotosForm.map((f, i) => `
    <div class="foto-item">
      <img src="${esc(f.existente ? f.url : f.preview)}" alt="Foto ${i + 1}">
      <button type="button" class="foto-remover" data-i="${i}" aria-label="Remover foto">×</button>
    </div>
  `).join("");

  $("fotos-contador").textContent =
    `${fotosForm.length}/${MAX_FOTOS} fotos`;
}

async function adicionarFotos(lista) {
  for (const file of Array.from(lista)) {
    if (fotosForm.length >= MAX_FOTOS) {
      toast(`Máximo de ${MAX_FOTOS} fotos por OS.`);
      break;
    }

    if (!file.type.startsWith("image/")) {
      continue;
    }

    const blob = await comprimirImagem(file);

    if (!blob) {
      toast(`Não foi possível ler "${file.name}".`);
      continue;
    }

    fotosForm.push({
      existente: false,
      file: blob,
      preview: URL.createObjectURL(blob)
    });
  }

  renderFotosForm();
}

/* ---------- CÂMERA ---------- */
let cameraStream = null;
let cameraFacing = "environment";
let fotosTiradas = 0;

async function iniciarCamera() {
  pararCamera();

  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: cameraFacing },
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  });

  $("camera-video").srcObject = cameraStream;
}

function pararCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }

  $("camera-video").srcObject = null;
}

async function abrirCamera() {
  if (fotosForm.length >= MAX_FOTOS) {
    return toast(`Máximo de ${MAX_FOTOS} fotos por OS.`);
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    // sem acesso direto à câmera: usa a câmera do sistema
    return $("fotos-camera").click();
  }

  try {
    fotosTiradas = 0;
    $("camera-info").textContent =
      "Aponte para o aparelho e toque no botão redondo.";

    await iniciarCamera();

    $("camera-modal").classList.add("open");
  } catch (e) {
    console.error(e);
    toast("Não consegui acessar a câmera. Usando a câmera do aparelho.");
    $("fotos-camera").click();
  }
}

function fecharCamera() {
  pararCamera();
  $("camera-modal").classList.remove("open");
}

async function trocarCamera() {
  cameraFacing =
    cameraFacing === "environment" ? "user" : "environment";

  try {
    await iniciarCamera();
  } catch (e) {
    console.error(e);
    toast("Não foi possível trocar de câmera.");
  }
}

function capturarFoto() {
  const video = $("camera-video");

  if (!video.videoWidth) {
    return;
  }

  if (fotosForm.length >= MAX_FOTOS) {
    toast(`Máximo de ${MAX_FOTOS} fotos por OS.`);
    return fecharCamera();
  }

  const escala = Math.min(
    1,
    1600 / Math.max(video.videoWidth, video.videoHeight)
  );

  const canvas = document.createElement("canvas");

  canvas.width = Math.round(video.videoWidth * escala);
  canvas.height = Math.round(video.videoHeight * escala);

  canvas.getContext("2d")
    .drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    if (!blob) {
      return toast("Erro ao capturar a foto.");
    }

    fotosForm.push({
      existente: false,
      file: blob,
      preview: URL.createObjectURL(blob)
    });

    fotosTiradas++;

    renderFotosForm();

    const box = $("camera-modal");

    box.classList.add("flash");
    setTimeout(() => box.classList.remove("flash"), 150);

    $("camera-info").textContent =
      `${fotosTiradas} foto(s) tirada(s) • total ${fotosForm.length}/${MAX_FOTOS}`;

    if (fotosForm.length >= MAX_FOTOS) {
      fecharCamera();
    }
  }, "image/jpeg", 0.85);
}

function removerFotoForm(i) {
  const f = fotosForm[i];

  if (!f) {
    return;
  }

  if (f.existente) {
    fotosRemovidas.push({ path: f.path, url: f.url });
  } else {
    URL.revokeObjectURL(f.preview);
  }

  fotosForm.splice(i, 1);
  renderFotosForm();
}

function mensagemErroFoto(error) {
  const msg = String(error.message || error.error || error);
  const baixa = msg.toLowerCase();

  if (baixa.includes("bucket not found")) {
    return 'O espaço "fotos-os" não existe no Supabase. Rode o supabase.sql no SQL Editor.';
  }

  if (baixa.includes("row-level security") || baixa.includes("violates") || baixa.includes("unauthorized")) {
    return "Sem permissão para enviar. Rode o supabase.sql (parte das fotos) no Supabase.";
  }

  if (baixa.includes("mime")) {
    return "Tipo de arquivo não aceito pelo Supabase.";
  }

  if (baixa.includes("size") || baixa.includes("too large") || baixa.includes("exceed")) {
    return "A foto é grande demais para o limite do Supabase.";
  }

  if (baixa.includes("failed to fetch") || baixa.includes("network")) {
    return "Sem conexão com o Supabase. Confira a internet e o config.js.";
  }

  return `Erro ao enviar as fotos: ${msg}`;
}

async function enviarFotosNovas() {
  const enviadas = [];

  for (const f of fotosForm.filter(x => !x.existente)) {
    const path =
      `os/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;

    const { error } = await supabaseClient
      .storage
      .from(BUCKET_FOTOS)
      .upload(path, f.file, {
        contentType: "image/jpeg",
        cacheControl: "31536000"
      });

    if (error) {
      console.error(error);
      await removerDoStorage(enviadas);
      throw new Error(mensagemErroFoto(error));
    }

    const { data } = supabaseClient
      .storage
      .from(BUCKET_FOTOS)
      .getPublicUrl(path);

    enviadas.push({ path, url: data.publicUrl });
  }

  return enviadas;
}

async function removerDoStorage(lista) {
  const paths = (lista || []).map(f => f.path).filter(Boolean);

  if (!paths.length) {
    return;
  }

  const { error } = await supabaseClient
    .storage
    .from(BUCKET_FOTOS)
    .remove(paths);

  if (error) {
    console.error(error);
  }
}

function galeriaFotos(fotos) {
  if (!Array.isArray(fotos) || !fotos.length) {
    return "";
  }

  return `
    <div class="detail-card fotos">
      <h3>Fotos (${fotos.length})</h3>
      <div class="fotos-detalhe">
        ${fotos.map((f, i) => `
          <img src="${esc(f.url)}" alt="Foto ${i + 1}" data-full="${esc(f.url)}" loading="lazy">
        `).join("")}
      </div>
    </div>
  `;
}

function abrirLightbox(url) {
  $("lightbox-img").src = url;
  $("lightbox").classList.add("open");
}

function fecharLightbox() {
  $("lightbox").classList.remove("open");
  $("lightbox-img").src = "";
}

const $ = (id) => document.getElementById(id);

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function numero(valor) {
  const n = Number(String(valor ?? 0).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function esc(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dataBR(iso) {
  if (!iso) return "-";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return d.toLocaleString("pt-BR");
}

function toast(texto, ms = 2400) {
  const t = $("toast");

  t.textContent = texto;

  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, ms);
}

function showView(nome) {
  document
    .querySelectorAll(".view")
    .forEach(v => v.classList.remove("active"));

  document
    .querySelectorAll(".nav-btn")
    .forEach(b => b.classList.remove("active"));

  const view = $(`view-${nome}`);

  if (view) {
    view.classList.add("active");
  }

  const btn = document.querySelector(
    `.nav-btn[data-view="${nome}"]`
  );

  if (btn) {
    btn.classList.add("active");
  }

  if (nome === "dashboard") {
    carregarDashboard();
  }

  if (nome === "ordens") {
    carregarOrdens();
  }
}

function totalFormulario() {
  const total = Math.max(
    0,
    numero($("valor_pecas").value)
    + numero($("valor_mao_obra").value)
    - numero($("desconto").value)
  );

  $("valor_total").value = moeda(total);

  return total;
}

function limparFormulario() {
  $("os-form").reset();

  $("os-id").value = "";

  $("form-title").textContent =
    "Nova Ordem de Serviço";

  $("valor_pecas").value = "0";

  $("valor_mao_obra").value = "0";

  $("desconto").value = "0";

  $("valor_total").value = moeda(0);

  $("status").value = "Aberta";

  testesRapidos = {};
  renderTestesRapidos();

  fotosForm.forEach(f => {
    if (!f.existente) URL.revokeObjectURL(f.preview);
  });

  fotosForm = [];
  fotosRemovidas = [];
  renderFotosForm();
}

function dadosFormulario() {
  return {
    cliente_nome:
      $("cliente_nome").value.trim(),

    cliente_documento:
      $("cliente_documento").value.trim(),

    cliente_telefone:
      $("cliente_telefone").value.trim(),

    aparelho_tipo:
      $("aparelho_tipo").value.trim(),

    aparelho_marca:
      $("aparelho_marca").value.trim(),

    aparelho_modelo:
      $("aparelho_modelo").value.trim(),

    aparelho_serial:
      $("aparelho_serial").value.trim(),

    aparelho_cor:
      $("aparelho_cor").value.trim(),

    aparelho_acessorios:
      $("aparelho_acessorios").value.trim(),

    defeito_relatado:
      $("defeito_relatado").value.trim(),

    diagnostico:
      $("diagnostico").value.trim(),

    servico_realizado:
      $("servico_realizado").value.trim(),

    pecas_utilizadas:
      $("pecas_utilizadas").value.trim(),

    testes_realizados:
      montarTestes(),

    valor_pecas:
      numero($("valor_pecas").value),

    valor_mao_obra:
      numero($("valor_mao_obra").value),

    desconto:
      numero($("desconto").value),

    valor_total:
      totalFormulario(),

    garantia:
      $("garantia").value.trim(),

    observacoes:
      $("observacoes").value.trim(),

    status:
      $("status").value
  };
}

async function salvarOS(evento) {
  evento.preventDefault();

  if (salvando) {
    return;
  }

  const btn = $("os-form").querySelector('button[type="submit"]');

  salvando = true;
  btn.disabled = true;

  try {
    await salvarOSInterno(evento);
  } finally {
    salvando = false;
    btn.disabled = false;
  }
}

async function salvarOSInterno(evento) {
  evento.preventDefault();

  const dados = dadosFormulario();

  if (!dados.cliente_nome) {
    return toast("Informe o nome do cliente.");
  }

  const id = $("os-id").value;

  let enviadas = [];

  try {
    if (fotosForm.some(f => !f.existente)) {
      toast("Enviando fotos...");
    }

    enviadas = await enviarFotosNovas();
  } catch (e) {
    return toast(e.message, 9000);
  }

  dados.fotos = [
    ...fotosForm
      .filter(f => f.existente)
      .map(f => ({ path: f.path, url: f.url })),
    ...enviadas
  ];

  if (id) {
    const { error } = await supabaseClient
      .from("ordens")
      .update(dados)
      .eq("id", Number(id));

    if (error) {
      console.error(error);
      await removerDoStorage(enviadas);
      return toast("Erro ao atualizar a OS.");
    }

    toast(`OS #${id} atualizada.`);

    await removerDoStorage(fotosRemovidas);
    fotosRemovidas = [];

    detalheAtual = Number(id);

    await abrirOS(Number(id));

    return;
  }

  const { data, error } = await supabaseClient
    .from("ordens")
    .insert(dados)
    .select()
    .single();

  if (error) {
    console.error(error);
    await removerDoStorage(enviadas);
    return toast("Erro ao salvar a OS.");
  }

  toast(`OS #${data.id} salva.`);

  fotosRemovidas = [];

  detalheAtual = data.id;

  await abrirOS(data.id);
}

async function carregarDashboard() {
  const { data, error } = await supabaseClient
    .from("ordens")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    toast("Erro ao carregar o painel.");
    return;
  }

  const ordens = data || [];

  $("card-total").textContent =
    ordens.length;

  $("card-abertas").textContent =
    ordens.filter(o => o.status === "Aberta").length;

  $("card-andamento").textContent =
    ordens.filter(
      o => o.status === "Em andamento"
    ).length;

  $("card-prontas").textContent =
    ordens.filter(o => o.status === "Pronta").length;

  const faturamento = ordens.reduce(
    (soma, os) =>
      soma + numero(os.valor_total),
    0
  );

  $("faturamento").textContent =
    moeda(faturamento);

  const recentes =
    $("recentes");

  recentes.innerHTML = "";

  const ultimas =
    ordens.slice(0, 5);

  if (!ultimas.length) {
    recentes.innerHTML = `
      <div class="empty">
        Nenhuma ordem cadastrada.
      </div>
    `;

    return;
  }

  ultimas.forEach(os => {
    recentes.appendChild(
      cardOS(os)
    );
  });
}

function cardOS(os) {
  const el =
    document.createElement("div");

  el.className =
    "list-item";

  el.innerHTML = `
    <div class="list-main">

      <strong>
        OS #${os.id} • ${esc(os.cliente_nome)}
      </strong>

      <span>
        ${esc(os.aparelho_tipo)}
        ${esc(os.aparelho_marca)}
        ${esc(os.aparelho_modelo)}
      </span>

      <span>
        ${esc(os.cliente_telefone)}
      </span>

    </div>

    <div class="list-side">

      <span class="status-pill" data-status="${esc(os.status)}">
        ${esc(os.status)}
      </span>

      <strong>
        ${moeda(os.valor_total)}
      </strong>

      <button
        class="primary"
        type="button"
      >
        Abrir
      </button>

    </div>
  `;

  el
    .querySelector("button")
    .addEventListener(
      "click",
      () => abrirOS(os.id)
    );

  return el;
}

function dentroPeriodo(createdAt, filtro) {
  if (!filtro) {
    return true;
  }

  const data =
    new Date(createdAt);

  if (Number.isNaN(data.getTime())) {
    return true;
  }

  const agora =
    new Date();

  if (filtro === "hoje") {
    return (
      data.getFullYear() === agora.getFullYear()
      && data.getMonth() === agora.getMonth()
      && data.getDate() === agora.getDate()
    );
  }

  const dias =
    Number(filtro);

  if (!dias) {
    return true;
  }

  const limite =
    new Date();

  limite.setDate(
    limite.getDate() - dias
  );

  return data >= limite;
}

async function carregarOrdens() {
  const { data, error } = await supabaseClient
    .from("ordens")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return toast(
      "Erro ao carregar ordens."
    );
  }

  todasOrdens =
    data || [];

  const busca =
    $("busca")
      .value
      .trim()
      .toLowerCase();

  const status =
    $("filtro-status").value;

  const filtroData =
    $("filtro-data").value;

  const marca =
    $("filtro-marca")
      .value
      .trim()
      .toLowerCase();

  const tipo =
    $("filtro-tipo")
      .value
      .trim()
      .toLowerCase();

  const filtradas =
    todasOrdens.filter(os => {

      if (busca) {
        const texto = `
          ${os.id || ""}
          ${os.cliente_nome || ""}
          ${os.cliente_telefone || ""}
          ${os.aparelho_tipo || ""}
          ${os.aparelho_marca || ""}
          ${os.aparelho_modelo || ""}
          ${os.aparelho_serial || ""}
        `.toLowerCase();

        if (!texto.includes(busca)) {
          return false;
        }
      }

      if (
        status
        && os.status !== status
      ) {
        return false;
      }

      if (
        marca
        && !(os.aparelho_marca || "")
          .toLowerCase()
          .includes(marca)
      ) {
        return false;
      }

      if (
        tipo
        && !(os.aparelho_tipo || "")
          .toLowerCase()
          .includes(tipo)
      ) {
        return false;
      }

      if (
        !dentroPeriodo(
          os.created_at,
          filtroData
        )
      ) {
        return false;
      }

      return true;
    });

  const lista =
    $("lista-ordens");

  lista.innerHTML = "";

  if (!filtradas.length) {
    lista.innerHTML = `
      <div class="empty">
        Nenhuma ordem encontrada.
      </div>
    `;

    return;
  }

  filtradas.forEach(os => {
    lista.appendChild(
      cardOS(os)
    );
  });
}

async function abrirOS(id) {
  const { data: os, error } = await supabaseClient
    .from("ordens")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return toast(
      "Erro ao abrir a OS."
    );
  }

  detalheAtual =
    os.id;

  $("detalhe-title").textContent =
    `Ordem de Serviço #${os.id}`;

  $("detalhe-subtitle").textContent =
    `${dataBR(os.created_at)} • ${os.status || ""}`;

  $("detalhe-conteudo").innerHTML = `
    <div class="detail-card">
      <h3>Cliente</h3>

      <p>
        <strong>Nome:</strong>
        ${esc(os.cliente_nome) || "-"}
      </p>

      <p>
        <strong>CPF/CNPJ:</strong>
        ${esc(os.cliente_documento) || "-"}
      </p>

      <p>
        <strong>Telefone/WhatsApp:</strong>
        ${esc(os.cliente_telefone) || "-"}
      </p>
    </div>

    <div class="detail-card">
      <h3>Aparelho</h3>

      <p>
        <strong>Tipo:</strong>
        ${esc(os.aparelho_tipo) || "-"}
      </p>

      <p>
        <strong>Marca:</strong>
        ${esc(os.aparelho_marca) || "-"}
      </p>

      <p>
        <strong>Modelo:</strong>
        ${esc(os.aparelho_modelo) || "-"}
      </p>

      <p>
        <strong>Serial/IMEI:</strong>
        ${esc(os.aparelho_serial) || "-"}
      </p>

      <p>
        <strong>Cor:</strong>
        ${esc(os.aparelho_cor) || "-"}
      </p>

      <p>
        <strong>Acessórios:</strong>
        ${esc(os.aparelho_acessorios) || "-"}
      </p>
    </div>

    <div class="detail-card">
      <h3>Defeito relatado</h3>

      <p>
        ${esc(os.defeito_relatado) || "-"}
      </p>
    </div>

    <div class="detail-card">
      <h3>Diagnóstico</h3>

      <p>
        ${esc(os.diagnostico) || "-"}
      </p>
    </div>

    <div class="detail-card">
      <h3>Serviço realizado</h3>

      <p>
        ${esc(os.servico_realizado) || "-"}
      </p>

      <p>
        <strong>Peças:</strong>
        ${esc(os.pecas_utilizadas) || "-"}
      </p>
    </div>

    <div class="detail-card">
      <h3>Testes</h3>

      ${testesHTML(os.testes_realizados)}
    </div>

    <div class="detail-card">
      <h3>Valores</h3>

      <p>
        <strong>Peças:</strong>
        ${moeda(os.valor_pecas)}
      </p>

      <p>
        <strong>Mão de obra:</strong>
        ${moeda(os.valor_mao_obra)}
      </p>

      <p>
        <strong>Desconto:</strong>
        ${moeda(os.desconto)}
      </p>

      <p>
        <strong>Total:</strong>
        ${moeda(os.valor_total)}
      </p>
    </div>

    <div class="detail-card">
      <h3>Finalização</h3>

      <p>
        <strong>Garantia:</strong>
        ${esc(os.garantia) || "-"}
      </p>

      <p>
        <strong>Status:</strong>
        <span class="status-pill" data-status="${esc(os.status)}">${esc(os.status) || "-"}</span>
      </p>

      <p>
        <strong>Observações:</strong>
        ${esc(os.observacoes) || "-"}
      </p>
    </div>

    ${galeriaFotos(os.fotos)}
  `;

  showView("detalhe");
}

async function editarOS(id) {
  const { data: os, error } = await supabaseClient
    .from("ordens")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);

    return toast(
      "Erro ao carregar a OS para edição."
    );
  }

  $("os-id").value =
    os.id;

  $("form-title").textContent =
    `Editar Ordem de Serviço #${os.id}`;

  [
    "cliente_nome",
    "cliente_documento",
    "cliente_telefone",
    "aparelho_tipo",
    "aparelho_marca",
    "aparelho_modelo",
    "aparelho_serial",
    "aparelho_cor",
    "aparelho_acessorios",
    "defeito_relatado",
    "diagnostico",
    "servico_realizado",
    "pecas_utilizadas",
    "testes_realizados",
    "garantia",
    "observacoes",
    "status"
  ].forEach(campo => {
    $(campo).value =
      os[campo] ?? "";
  });

  carregarTestes(os.testes_realizados);

  $("valor_pecas").value =
    numero(os.valor_pecas);

  $("valor_mao_obra").value =
    numero(os.valor_mao_obra);

  $("desconto").value =
    numero(os.desconto);

  $("valor_total").value =
    moeda(os.valor_total);

  fotosForm = (Array.isArray(os.fotos) ? os.fotos : [])
    .map(f => ({ existente: true, path: f.path, url: f.url }));

  fotosRemovidas = [];

  renderFotosForm();

  showView("nova");
}

async function excluirOS(id) {
  if (!confirm(`Excluir a OS #${id}?`)) {
    return;
  }

  const { data: osFotos } = await supabaseClient
    .from("ordens")
    .select("fotos")
    .eq("id", id)
    .single();

  const { error } = await supabaseClient
    .from("ordens")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return toast(
      "Erro ao excluir."
    );
  }

  await removerDoStorage(osFotos && osFotos.fotos);

  toast("OS excluída.");

  detalheAtual =
    null;

  showView("ordens");
}

function imprimirOS() {
  window.print();
}

/* EVENTOS */

document
  .querySelectorAll(".nav-btn")
  .forEach(btn => {
    btn.addEventListener(
      "click",
      () => {

        const view =
          btn.dataset.view;

        if (view === "nova") {
          limparFormulario();
        }

        showView(view);
      }
    );
  });

$("btn-nova-dashboard")
  .addEventListener(
    "click",
    () => {
      limparFormulario();
      showView("nova");
    }
  );

$("btn-cancelar-form")
  .addEventListener(
    "click",
    () => {
      limparFormulario();
      showView("dashboard");
    }
  );

$("os-form")
  .addEventListener(
    "submit",
    salvarOS
  );

[
  "valor_pecas",
  "valor_mao_obra",
  "desconto"
].forEach(id => {
  $(id).addEventListener(
    "input",
    totalFormulario
  );
});

$("btn-buscar")
  .addEventListener(
    "click",
    carregarOrdens
  );

$("btn-filtrar")
  .addEventListener(
    "click",
    carregarOrdens
  );

$("busca")
  .addEventListener(
    "keydown",
    evento => {

      if (evento.key === "Enter") {
        carregarOrdens();
      }
    }
  );

$("btn-limpar-filtros")
  .addEventListener(
    "click",
    () => {

      $("busca").value = "";

      $("filtro-status").value = "";

      $("filtro-data").value = "";

      $("filtro-marca").value = "";

      $("filtro-tipo").value = "";

      carregarOrdens();
    }
  );

$("btn-voltar-lista")
  .addEventListener(
    "click",
    () => showView("ordens")
  );

$("btn-editar")
  .addEventListener(
    "click",
    () => {

      if (detalheAtual) {
        editarOS(detalheAtual);
      }
    }
  );

$("btn-excluir")
  .addEventListener(
    "click",
    () => {

      if (detalheAtual) {
        excluirOS(detalheAtual);
      }
    }
  );

$("btn-imprimir")
  .addEventListener(
    "click",
    imprimirOS
  );

$("fotos-input")
  .addEventListener(
    "change",
    async evento => {
      await adicionarFotos(evento.target.files);
      evento.target.value = "";
    }
  );

$("testes-rapidos")
  .addEventListener(
    "click",
    evento => {
      const btn = evento.target.closest(".seg-btn");

      if (!btn) {
        return;
      }

      const nome = btn.dataset.t;

      if (testesRapidos[nome] === btn.dataset.v) {
        delete testesRapidos[nome];
      } else {
        testesRapidos[nome] = btn.dataset.v;
      }

      renderTestesRapidos();
    }
  );

$("btn-tudo-ok")
  .addEventListener(
    "click",
    () => {
      TESTES_ITENS.forEach(n => testesRapidos[n] = "OK");
      renderTestesRapidos();
    }
  );

$("btn-limpar-testes")
  .addEventListener(
    "click",
    () => {
      testesRapidos = {};
      renderTestesRapidos();
    }
  );

$("btn-camera")
  .addEventListener("click", abrirCamera);

$("camera-capturar")
  .addEventListener("click", capturarFoto);

$("camera-fechar")
  .addEventListener("click", fecharCamera);

$("camera-trocar")
  .addEventListener("click", trocarCamera);

$("fotos-camera")
  .addEventListener(
    "change",
    async evento => {
      await adicionarFotos(evento.target.files);
      evento.target.value = "";
    }
  );

$("fotos-previa")
  .addEventListener(
    "click",
    evento => {
      const btn = evento.target.closest(".foto-remover");

      if (btn) {
        removerFotoForm(Number(btn.dataset.i));
      }
    }
  );

$("detalhe-conteudo")
  .addEventListener(
    "click",
    evento => {
      const img = evento.target.closest("img[data-full]");

      if (img) {
        abrirLightbox(img.dataset.full);
      }
    }
  );

$("lightbox")
  .addEventListener("click", fecharLightbox);

document
  .addEventListener(
    "keydown",
    evento => {
      if (evento.key === "Escape") {
        fecharCamera();
        fecharLightbox();
      }
    }
  );

/* INICIALIZAÇÃO */

renderTestesRapidos();
renderFotosForm();
carregarDashboard();