(() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const mensagem = document.getElementById("mensagem");
  const token = new URLSearchParams(window.location.search).get("token");
  const client = supabase.createClient(cfg.url, cfg.key);

  const texto = (id, value) => {
    document.getElementById(id).textContent = value || "-";
  };

  const dataBR = value => {
    if (!value) return "-";
    const data = new Date(value);
    return Number.isNaN(data.getTime()) ? "-" : data.toLocaleString("pt-BR");
  };

  async function carregar() {
    if (!token) {
      mensagem.textContent = "Link de acompanhamento inválido ou incompleto.";
      mensagem.classList.add("error");
      return;
    }

    const { data, error } = await client.rpc("consultar_acompanhamento", {
      p_token: token
    });

    if (error) {
      console.error(error);
      mensagem.textContent = "Não foi possível consultar a ordem agora. Tente novamente mais tarde.";
      mensagem.classList.add("error");
      return;
    }

    if (!data) {
      mensagem.textContent = "Não encontramos uma OS para este link. Confira se o endereço está correto.";
      mensagem.classList.add("error");
      return;
    }

    mensagem.textContent = `Olá, ${data.cliente_nome || "cliente"}! Veja abaixo o andamento do seu aparelho.`;
    texto("status-atual", data.status);
    texto("os-id", `#${data.id}`);
    texto("cliente", data.cliente_nome);
    texto("aparelho", [data.aparelho_tipo, data.aparelho_marca, data.aparelho_modelo].filter(Boolean).join(" "));
    texto("entrada", dataBR(data.created_at));

    document.getElementById("resultado").hidden = false;
    document.getElementById("dados-card").hidden = false;
    document.getElementById("historico-card").hidden = false;

    const lista = document.getElementById("historico");
    lista.replaceChildren();

    (data.historico || []).forEach(item => {
      const li = document.createElement("li");
      const dot = document.createElement("span");
      dot.className = "dot";
      const status = document.createElement("strong");
      status.textContent = item.status || "Atualização";
      const quando = document.createElement("time");
      quando.textContent = dataBR(item.criado_em);
      li.append(dot, status, quando);
      lista.appendChild(li);
    });
  }

  document.getElementById("atualizar").addEventListener("click", carregar);
  carregar();
  window.setInterval(carregar, 30000);
})();
