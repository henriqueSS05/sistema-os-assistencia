const cfg = window.SUPABASE_CONFIG || {};

if (!cfg.url || !cfg.key || cfg.url.includes("COLE_AQUI")) {
  alert("Configure o Supabase no arquivo config.js antes de usar o sistema.");
}

const supabaseClient = supabase.createClient(cfg.url, cfg.key);

let detalheAtual = null;
let todasOrdens = [];

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

function toast(texto) {
  const t = $("toast");

  t.textContent = texto;

  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2400);
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
      $("testes_realizados").value.trim(),

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

  const dados = dadosFormulario();

  if (!dados.cliente_nome) {
    return toast("Informe o nome do cliente.");
  }

  const id = $("os-id").value;

  if (id) {
    const { error } = await supabaseClient
      .from("ordens")
      .update(dados)
      .eq("id", Number(id));

    if (error) {
      console.error(error);
      return toast("Erro ao atualizar a OS.");
    }

    toast(`OS #${id} atualizada.`);

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
    return toast("Erro ao salvar a OS.");
  }

  toast(`OS #${data.id} salva.`);

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

      <span class="status-pill">
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

      <p>
        ${esc(os.testes_realizados) || "-"}
      </p>
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
        ${esc(os.status) || "-"}
      </p>

      <p>
        <strong>Observações:</strong>
        ${esc(os.observacoes) || "-"}
      </p>
    </div>
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

  $("valor_pecas").value =
    numero(os.valor_pecas);

  $("valor_mao_obra").value =
    numero(os.valor_mao_obra);

  $("desconto").value =
    numero(os.desconto);

  $("valor_total").value =
    moeda(os.valor_total);

  showView("nova");
}

async function excluirOS(id) {
  if (!confirm(`Excluir a OS #${id}?`)) {
    return;
  }

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

/* INICIALIZAÇÃO */

carregarDashboard();
