const cfg = window.SUPABASE_CONFIG || {};

if (
  !cfg.url ||
  !cfg.key ||
  cfg.url.includes("COLE_AQUI")
) {
  alert(
    "Configure o Supabase no arquivo config.js antes de usar o sistema."
  );
}

const supabaseClient = supabase.createClient(
  cfg.url,
  cfg.key
);

let detalheAtual = null;
let todasOrdens = [];

const $ = (id) => document.getElementById(id);


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function moeda(valor) {
  return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}


function numero(valor) {
  const n = Number(
    String(valor ?? 0).replace(",", ".")
  );

  return Number.isFinite(n)
    ? n
    : 0;
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

  if (!iso) {
    return "-";
  }

  const d = new Date(iso);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return iso;
  }

  return d.toLocaleString(
    "pt-BR"
  );
}


/* =========================================
   TOAST
========================================= */

function toast(texto) {

  const t = $("toast");

  if (!t) {
    console.log(texto);
    return;
  }

  t.textContent = texto;

  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2400);
}


/* =========================================
   CAMPOS COM MAIS DE UMA OPÇÃO
========================================= */

function pegarMultiplos(id) {

  const campo = $(id);

  if (!campo) {
    return "";
  }

  return Array.from(
    campo.selectedOptions || []
  )
    .map(option => option.value)
    .filter(Boolean)
    .join(", ");
}


function marcarMultiplos(
  id,
  texto
) {

  const campo = $(id);

  if (!campo) {
    return;
  }

  const selecionados =
    String(texto || "")
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

  Array.from(
    campo.options
  ).forEach(option => {

    option.selected =
      selecionados.includes(
        option.value
      );

  });
}


/* =========================================
   NAVEGAÇÃO
========================================= */

function showView(nome) {

  document
    .querySelectorAll(".view")
    .forEach(view => {

      view.classList.remove(
        "active"
      );

    });


  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  const view =
    $(`view-${nome}`);


  if (view) {

    view.classList.add(
      "active"
    );

  }


  const btn =
    document.querySelector(
      `.nav-btn[data-view="${nome}"]`
    );


  if (btn) {

    btn.classList.add(
      "active"
    );

  }


  if (
    nome === "dashboard"
  ) {

    carregarDashboard();

  }


  if (
    nome === "ordens"
  ) {

    carregarOrdens();

  }
}


/* =========================================
   TOTAL DA OS
========================================= */

function totalFormulario() {

  const valorPecas =
    numero(
      $("valor_pecas")?.value
    );


  const valorMaoObra =
    numero(
      $("valor_mao_obra")?.value
    );


  const desconto =
    numero(
      $("desconto")?.value
    );


  const total =
    Math.max(
      0,
      valorPecas
      + valorMaoObra
      - desconto
    );


  if (
    $("valor_total")
  ) {

    $("valor_total").value =
      moeda(total);

  }


  return total;
}


/* =========================================
   LIMPAR FORMULÁRIO
========================================= */

function limparFormulario() {

  const form =
    $("os-form");


  if (!form) {
    return;
  }


  form.reset();


  if (
    $("os-id")
  ) {

    $("os-id").value =
      "";

  }


  if (
    $("form-title")
  ) {

    $("form-title").textContent =
      "Nova Ordem de Serviço";

  }


  if (
    $("valor_pecas")
  ) {

    $("valor_pecas").value =
      "0";

  }


  if (
    $("valor_mao_obra")
  ) {

    $("valor_mao_obra").value =
      "0";

  }


  if (
    $("desconto")
  ) {

    $("desconto").value =
      "0";

  }


  if (
    $("valor_total")
  ) {

    $("valor_total").value =
      moeda(0);

  }


  if (
    $("status")
  ) {

    $("status").value =
      "Aberta";

  }


  marcarMultiplos(
    "aparelho_acessorios",
    ""
  );


  marcarMultiplos(
    "servico_realizado",
    ""
  );
}


/* =========================================
   PEGAR DADOS DO FORMULÁRIO
========================================= */

function dadosFormulario() {

  return {

    cliente_nome:
      $("cliente_nome")
        ?.value
        .trim() || "",


    cliente_documento:
      $("cliente_documento")
        ?.value
        .trim() || "",


    cliente_telefone:
      $("cliente_telefone")
        ?.value
        .trim() || "",


    aparelho_tipo:
      $("aparelho_tipo")
        ?.value
        .trim() || "",


    aparelho_marca:
      $("aparelho_marca")
        ?.value
        .trim() || "",


    aparelho_modelo:
      $("aparelho_modelo")
        ?.value
        .trim() || "",


    aparelho_serial:
      $("aparelho_serial")
        ?.value
        .trim() || "",


    aparelho_cor:
      $("aparelho_cor")
        ?.value
        .trim() || "",


    aparelho_acessorios:
      pegarMultiplos(
        "aparelho_acessorios"
      ),


    defeito_relatado:
      $("defeito_relatado")
        ?.value
        .trim() || "",


    diagnostico:
      $("diagnostico")
        ?.value
        .trim() || "",


    servico_realizado:
      pegarMultiplos(
        "servico_realizado"
      ),


    pecas_utilizadas:
      $("pecas_utilizadas")
        ?.value
        .trim() || "",


    testes_realizados:
      $("testes_realizados")
        ?.value
        .trim() || "",


    valor_pecas:
      numero(
        $("valor_pecas")
          ?.value
      ),


    valor_mao_obra:
      numero(
        $("valor_mao_obra")
          ?.value
      ),


    desconto:
      numero(
        $("desconto")
          ?.value
      ),


    valor_total:
      totalFormulario(),


    garantia:
      $("garantia")
        ?.value
        .trim() || "",


    observacoes:
      $("observacoes")
        ?.value
        .trim() || "",


    status:
      $("status")
        ?.value || "Aberta"

  };
}


/* =========================================
   SALVAR / ATUALIZAR OS
========================================= */

async function salvarOS(
  evento
) {

  evento.preventDefault();


  const dados =
    dadosFormulario();


  if (
    !dados.cliente_nome
  ) {

    return toast(
      "Informe o nome do cliente."
    );

  }


  const id =
    $("os-id")
      ?.value || "";


  /*
    ATUALIZAR
  */

  if (id) {

    const {
      error
    } =
      await supabaseClient

        .from("ordens")

        .update(dados)

        .eq(
          "id",
          Number(id)
        );


    if (error) {

      console.error(
        error
      );


      return toast(
        "Erro ao atualizar a OS."
      );

    }


    toast(
      `OS #${id} atualizada.`
    );


    detalheAtual =
      Number(id);


    await abrirOS(
      Number(id)
    );


    return;
  }


  /*
    CADASTRAR NOVA
  */

  const {
    data,
    error
  } =
    await supabaseClient

      .from("ordens")

      .insert(dados)

      .select()

      .single();


  if (error) {

    console.error(
      error
    );


    return toast(
      "Erro ao salvar a OS."
    );

  }


  toast(
    `OS #${data.id} salva.`
  );


  detalheAtual =
    data.id;


  await abrirOS(
    data.id
  );
}


/* =========================================
   DASHBOARD
========================================= */

async function carregarDashboard() {

  const {
    data,
    error
  } =
    await supabaseClient

      .from("ordens")

      .select("*")

      .order(
        "id",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      error
    );


    toast(
      "Erro ao carregar o painel."
    );


    return;
  }


  const ordens =
    data || [];


  /*
    TOTAL
  */

  if (
    $("card-total")
  ) {

    $("card-total").textContent =
      ordens.length;

  }


  /*
    ABERTAS
  */

  if (
    $("card-abertas")
  ) {

    $("card-abertas").textContent =

      ordens.filter(

        os =>
          os.status ===
          "Aberta"

      ).length;

  }


  /*
    EM ANDAMENTO
  */

  if (
    $("card-andamento")
  ) {

    $("card-andamento").textContent =

      ordens.filter(

        os =>
          os.status ===
          "Em andamento"

      ).length;

  }


  /*
    PRONTAS
  */

  if (
    $("card-prontas")
  ) {

    $("card-prontas").textContent =

      ordens.filter(

        os =>
          os.status ===
          "Pronta"

      ).length;

  }


  /*
    FATURAMENTO
  */

  const faturamento =

    ordens.reduce(

      (
        soma,
        os
      ) =>

        soma
        + numero(
          os.valor_total
        ),

      0

    );


  if (
    $("faturamento")
  ) {

    $("faturamento").textContent =
      moeda(
        faturamento
      );

  }


  /*
    ÚLTIMAS OS
  */

  const recentes =
    $("recentes");


  if (
    !recentes
  ) {

    return;
  }


  recentes.innerHTML =
    "";


  const ultimas =
    ordens.slice(
      0,
      5
    );


  if (
    !ultimas.length
  ) {

    recentes.innerHTML = `

      <div class="empty">

        Nenhuma ordem cadastrada.

      </div>

    `;


    return;
  }


  ultimas.forEach(
    os => {

      recentes.appendChild(
        cardOS(os)
      );

    }
  );
}


/* =========================================
   CRIAR CARD DE OS
========================================= */

function cardOS(os) {

  const el =
    document.createElement(
      "div"
    );


  el.className =
    "list-item";


  el.innerHTML = `

    <div class="list-main">

      <strong>

        OS #${os.id}
        •
        ${esc(
          os.cliente_nome
        )}

      </strong>


      <span>

        ${esc(
          os.aparelho_tipo
        )}

        ${esc(
          os.aparelho_marca
        )}

        ${esc(
          os.aparelho_modelo
        )}

      </span>


      <span>

        ${esc(
          os.cliente_telefone
        )}

      </span>

    </div>


    <div class="list-side">

      <span class="status-pill">

        ${esc(
          os.status
        )}

      </span>


      <strong>

        ${moeda(
          os.valor_total
        )}

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
    .querySelector(
      "button"
    )
    .addEventListener(
      "click",
      () => {

        abrirOS(
          os.id
        );

      }
    );


  return el;
}


/* =========================================
   FILTRO DE DATA
========================================= */

function dentroPeriodo(
  createdAt,
  filtro
) {

  if (
    !filtro
  ) {

    return true;

  }


  const data =
    new Date(
      createdAt
    );


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return true;

  }


  const agora =
    new Date();


  /*
    HOJE
  */

  if (
    filtro === "hoje"
  ) {

    return (

      data.getFullYear()
      ===
      agora.getFullYear()

      &&

      data.getMonth()
      ===
      agora.getMonth()

      &&

      data.getDate()
      ===
      agora.getDate()

    );
  }


  /*
    7 OU 30 DIAS
  */

  const dias =
    Number(
      filtro
    );


  if (
    !dias
  ) {

    return true;

  }


  const limite =
    new Date();


  limite.setDate(

    limite.getDate()
    - dias

  );


  return (
    data >= limite
  );
}


/* =========================================
   CARREGAR ORDENS
========================================= */

async function carregarOrdens() {

  const {
    data,
    error
  } =
    await supabaseClient

      .from("ordens")

      .select("*")

      .order(
        "id",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      error
    );


    return toast(
      "Erro ao carregar ordens."
    );

  }


  todasOrdens =
    data || [];


  /*
    BUSCA
  */

  const busca =

    $("busca")
      ?.value
      .trim()
      .toLowerCase()

    || "";


  /*
    STATUS
  */

  const status =

    $("filtro-status")
      ?.value

    || "";


  /*
    DATA
  */

  const filtroData =

    $("filtro-data")
      ?.value

    || "";


  /*
    MARCA
  */

  const marca =

    $("filtro-marca")
      ?.value
      .trim()
      .toLowerCase()

    || "";


  /*
    TIPO
  */

  const tipo =

    $("filtro-tipo")
      ?.value
      .trim()
      .toLowerCase()

    || "";


  /*
    FILTRAR
  */

  const filtradas =

    todasOrdens.filter(

      os => {


        /*
          BUSCA GERAL
        */

        if (
          busca
        ) {

          const texto = `

            ${os.id || ""}

            ${os.cliente_nome || ""}

            ${os.cliente_telefone || ""}

            ${os.aparelho_tipo || ""}

            ${os.aparelho_marca || ""}

            ${os.aparelho_modelo || ""}

            ${os.aparelho_serial || ""}

          `
            .toLowerCase();


          if (
            !texto.includes(
              busca
            )
          ) {

            return false;

          }

        }


        /*
          STATUS
        */

        if (

          status

          &&

          os.status
          !==
          status

        ) {

          return false;

        }


        /*
          MARCA
        */

        if (

          marca

          &&

          !(
            os.aparelho_marca
            || ""
          )
            .toLowerCase()
            .includes(
              marca
            )

        ) {

          return false;

        }


        /*
          TIPO
        */

        if (

          tipo

          &&

          !(
            os.aparelho_tipo
            || ""
          )
            .toLowerCase()
            .includes(
              tipo
            )

        ) {

          return false;

        }


        /*
          DATA
        */

        if (

          !dentroPeriodo(

            os.created_at,

            filtroData

          )

        ) {

          return false;

        }


        return true;

      }

    );


  /*
    MOSTRAR
  */

  const lista =
    $("lista-ordens");


  if (
    !lista
  ) {

    return;

  }


  lista.innerHTML =
    "";


  if (
    !filtradas.length
  ) {

    lista.innerHTML = `

      <div class="empty">

        Nenhuma ordem encontrada.

      </div>

    `;


    return;
  }


  filtradas.forEach(

    os => {

      lista.appendChild(
        cardOS(os)
      );

    }

  );
}


/* =========================================
   ABRIR DETALHES DA OS
========================================= */

async function abrirOS(id) {

  const {
    data: os,
    error
  } =
    await supabaseClient

      .from("ordens")

      .select("*")

      .eq(
        "id",
        id
      )

      .single();


  if (error) {

    console.error(
      error
    );


    return toast(
      "Erro ao abrir a OS."
    );

  }


  detalheAtual =
    os.id;


  if (
    $("detalhe-title")
  ) {

    $("detalhe-title").textContent =

      `Ordem de Serviço #${os.id}`;

  }


  if (
    $("detalhe-subtitle")
  ) {

    $("detalhe-subtitle").textContent =

      `${dataBR(os.created_at)}
      •
      ${os.status || ""}`;

  }


  const conteudo =
    $("detalhe-conteudo");


  if (
    conteudo
  ) {

    conteudo.innerHTML = `

      <div class="detail-card">

        <h3>
          Cliente
        </h3>


        <p>

          <strong>
            Nome:
          </strong>

          ${esc(
            os.cliente_nome
          ) || "-"}

        </p>


        <p>

          <strong>
            CPF/CNPJ:
          </strong>

          ${esc(
            os.cliente_documento
          ) || "-"}

        </p>


        <p>

          <strong>
            Telefone/WhatsApp:
          </strong>

          ${esc(
            os.cliente_telefone
          ) || "-"}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Aparelho
        </h3>


        <p>

          <strong>
            Tipo:
          </strong>

          ${esc(
            os.aparelho_tipo
          ) || "-"}

        </p>


        <p>

          <strong>
            Marca:
          </strong>

          ${esc(
            os.aparelho_marca
          ) || "-"}

        </p>


        <p>

          <strong>
            Modelo:
          </strong>

          ${esc(
            os.aparelho_modelo
          ) || "-"}

        </p>


        <p>

          <strong>
            Serial / IMEI:
          </strong>

          ${esc(
            os.aparelho_serial
          ) || "-"}

        </p>


        <p>

          <strong>
            Cor:
          </strong>

          ${esc(
            os.aparelho_cor
          ) || "-"}

        </p>


        <p>

          <strong>
            Acessórios:
          </strong>

          ${esc(
            os.aparelho_acessorios
          ) || "-"}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Defeito relatado
        </h3>

        <p>

          ${esc(
            os.defeito_relatado
          ) || "-"}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Diagnóstico
        </h3>

        <p>

          ${esc(
            os.diagnostico
          ) || "-"}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Serviço realizado
        </h3>

        <p>

          ${esc(
            os.servico_realizado
          ) || "-"}

        </p>


        <p>

          <strong>
            Peças utilizadas:
          </strong>

          ${esc(
            os.pecas_utilizadas
          ) || "-"}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Testes
        </h3>

        <p>

          ${esc(
            os.testes_realizados
          ) || "-"}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Valores
        </h3>


        <p>

          <strong>
            Peças:
          </strong>

          ${moeda(
            os.valor_pecas
          )}

        </p>


        <p>

          <strong>
            Mão de obra:
          </strong>

          ${moeda(
            os.valor_mao_obra
          )}

        </p>


        <p>

          <strong>
            Desconto:
          </strong>

          ${moeda(
            os.desconto
          )}

        </p>


        <p>

          <strong>
            Total:
          </strong>

          ${moeda(
            os.valor_total
          )}

        </p>

      </div>


      <div class="detail-card">

        <h3>
          Finalização
        </h3>


        <p>

          <strong>
            Garantia:
          </strong>

          ${esc(
            os.garantia
          ) || "-"}

        </p>


        <p>

          <strong>
            Status:
          </strong>

          ${esc(
            os.status
          ) || "-"}

        </p>


        <p>

          <strong>
            Observações:
          </strong>

          ${esc(
            os.observacoes
          ) || "-"}

        </p>

      </div>

    `;

  }


  showView(
    "detalhe"
  );
}


/* =========================================
   EDITAR OS
========================================= */

async function editarOS(id) {

  const {
    data: os,
    error
  } =
    await supabaseClient

      .from("ordens")

      .select("*")

      .eq(
        "id",
        id
      )

      .single();


  if (error) {

    console.error(
      error
    );


    return toast(
      "Erro ao carregar a OS para edição."
    );

  }


  /*
    ID
  */

  if (
    $("os-id")
  ) {

    $("os-id").value =
      os.id;

  }


  /*
    TÍTULO
  */

  if (
    $("form-title")
  ) {

    $("form-title").textContent =

      `Editar Ordem de Serviço #${os.id}`;

  }


  /*
    CAMPOS NORMAIS
  */

  [

    "cliente_nome",

    "cliente_documento",

    "cliente_telefone",

    "aparelho_tipo",

    "aparelho_marca",

    "aparelho_modelo",

    "aparelho_serial",

    "aparelho_cor",

    "defeito_relatado",

    "diagnostico",

    "pecas_utilizadas",

    "testes_realizados",

    "garantia",

    "observacoes",

    "status"

  ].forEach(

    campo => {

      if (
        $(campo)
      ) {

        $(campo).value =
          os[campo]
          ?? "";

      }

    }

  );


  /*
    ACESSÓRIOS
    MULTIPLOS
  */

  marcarMultiplos(

    "aparelho_acessorios",

    os.aparelho_acessorios

  );


  /*
    SERVIÇOS
    MULTIPLOS
  */

  marcarMultiplos(

    "servico_realizado",

    os.servico_realizado

  );


  /*
    VALOR PEÇAS
  */

  if (
    $("valor_pecas")
  ) {

    $("valor_pecas").value =
      numero(
        os.valor_pecas
      );

  }


  /*
    MÃO DE OBRA
  */

  if (
    $("valor_mao_obra")
  ) {

    $("valor_mao_obra").value =
      numero(
        os.valor_mao_obra
      );

  }


  /*
    DESCONTO
  */

  if (
    $("desconto")
  ) {

    $("desconto").value =
      numero(
        os.desconto
      );

  }


  /*
    TOTAL
  */

  if (
    $("valor_total")
  ) {

    $("valor_total").value =
      moeda(
        os.valor_total
      );

  }


  showView(
    "nova"
  );
}


/* =========================================
   EXCLUIR OS
========================================= */

async function excluirOS(id) {

  if (
    !confirm(
      `Excluir a OS #${id}?`
    )
  ) {

    return;

  }


  const {
    error
  } =
    await supabaseClient

      .from("ordens")

      .delete()

      .eq(
        "id",
        id
      );


  if (error) {

    console.error(
      error
    );


    return toast(
      "Erro ao excluir."
    );

  }


  toast(
    "OS excluída."
  );


  detalheAtual =
    null;


  showView(
    "ordens"
  );
}


/* =========================================
   IMPRIMIR
========================================= */

function imprimirOS() {

  window.print();

}


/* =========================================
   BOTÕES DO MENU
========================================= */

document
  .querySelectorAll(
    ".nav-btn"
  )
  .forEach(
    btn => {

      btn.addEventListener(

        "click",

        () => {

          const view =
            btn.dataset.view;


          if (
            view === "nova"
          ) {

            limparFormulario();

          }


          showView(
            view
          );

        }

      );

    }
  );


/* =========================================
   NOVA OS PELO PAINEL
========================================= */

if (
  $("btn-nova-dashboard")
) {

  $("btn-nova-dashboard")
    .addEventListener(

      "click",

      () => {

        limparFormulario();

        showView(
          "nova"
        );

      }

    );

}


/* =========================================
   CANCELAR FORMULÁRIO
========================================= */

if (
  $("btn-cancelar-form")
) {

  $("btn-cancelar-form")
    .addEventListener(

      "click",

      () => {

        limparFormulario();

        showView(
          "dashboard"
        );

      }

    );

}


/* =========================================
   SALVAR FORMULÁRIO
========================================= */

if (
  $("os-form")
) {

  $("os-form")
    .addEventListener(

      "submit",

      salvarOS

    );

}


/* =========================================
   CALCULAR TOTAL AUTOMÁTICO
========================================= */

[
  "valor_pecas",
  "valor_mao_obra",
  "desconto"
]
  .forEach(
    id => {

      if (
        $(id)
      ) {

        $(id)
          .addEventListener(

            "input",

            totalFormulario

          );

      }

    }
  );


/* =========================================
   BOTÃO BUSCAR
========================================= */

if (
  $("btn-buscar")
) {

  $("btn-buscar")
    .addEventListener(

      "click",

      carregarOrdens

    );

}


/* =========================================
   BOTÃO FILTRAR
========================================= */

if (
  $("btn-filtrar")
) {

  $("btn-filtrar")
    .addEventListener(

      "click",

      carregarOrdens

    );

}


/* =========================================
   ENTER NA BUSCA
========================================= */

if (
  $("busca")
) {

  $("busca")
    .addEventListener(

      "keydown",

      evento => {

        if (
          evento.key ===
          "Enter"
        ) {

          carregarOrdens();

        }

      }

    );

}


/* =========================================
   LIMPAR FILTROS
========================================= */

if (
  $("btn-limpar-filtros")
) {

  $("btn-limpar-filtros")
    .addEventListener(

      "click",

      () => {


        if (
          $("busca")
        ) {

          $("busca").value =
            "";

        }


        if (
          $("filtro-status")
        ) {

          $("filtro-status").value =
            "";

        }


        if (
          $("filtro-data")
        ) {

          $("filtro-data").value =
            "";

        }


        if (
          $("filtro-marca")
        ) {

          $("filtro-marca").value =
            "";

        }


        if (
          $("filtro-tipo")
        ) {

          $("filtro-tipo").value =
            "";

        }


        carregarOrdens();

      }

    );

}


/* =========================================
   VOLTAR PARA LISTA
========================================= */

if (
  $("btn-voltar-lista")
) {

  $("btn-voltar-lista")
    .addEventListener(

      "click",

      () => {

        showView(
          "ordens"
        );

      }

    );

}


/* =========================================
   EDITAR
========================================= */

if (
  $("btn-editar")
) {

  $("btn-editar")
    .addEventListener(

      "click",

      () => {

        if (
          detalheAtual
        ) {

          editarOS(
            detalheAtual
          );

        }

      }

    );

}


/* =========================================
   EXCLUIR
========================================= */

if (
  $("btn-excluir")
) {

  $("btn-excluir")
    .addEventListener(

      "click",

      () => {

        if (
          detalheAtual
        ) {

          excluirOS(
            detalheAtual
          );

        }

      }

    );

}


/* =========================================
   IMPRIMIR
========================================= */

if (
  $("btn-imprimir")
) {

  $("btn-imprimir")
    .addEventListener(

      "click",

      imprimirOS

    );

}


/* =========================================
   INICIAR SISTEMA
========================================= */

carregarDashboard();