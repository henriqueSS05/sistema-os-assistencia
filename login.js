
/* ===== TEMA LIGHT / DARK ===== */

const THEME_STORAGE_KEY = "fixos_tema";

const botaoTema = document.getElementById("theme-toggle-login");
const iconeTema = document.getElementById("theme-icon");
const legendaTema = document.getElementById("theme-label");

function aplicarTemaLogin(tema) {
  const temaAtual = tema === "dark" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", temaAtual);

  const escuroAtivo = temaAtual === "dark";

  if (iconeTema) {
    iconeTema.textContent = escuroAtivo ? "☀️" : "🌙";
  }

  if (legendaTema) {
    legendaTema.textContent = escuroAtivo
      ?""
      :"";
  }

  if (botaoTema) {
    botaoTema.setAttribute("aria-pressed", String(escuroAtivo));

    botaoTema.setAttribute(
      "aria-label",
      escuroAtivo ? "Ativar tema claro" : "Ativar tema escuro"
    );
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');

  if (metaTheme) {
    metaTheme.setAttribute(
      "content",
      escuroAtivo ? "#111522" : "#5b5bf0"
    );
  }
}

function inicializarTemaLogin() {
  let temaSalvo = "light";

  try {
    temaSalvo = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  } catch (erro) {
    console.warn("Não foi possível recuperar o tema.", erro);
  }

  aplicarTemaLogin(temaSalvo);

  if (botaoTema) {
    botaoTema.addEventListener("click", () => {
      const temaAtual =
        document.documentElement.getAttribute("data-theme");

      const proximoTema =
        temaAtual === "dark" ? "light" : "dark";

      aplicarTemaLogin(proximoTema);

      try {
        localStorage.setItem(THEME_STORAGE_KEY, proximoTema);
      } catch (erro) {
        console.warn("Não foi possível salvar o tema.", erro);
      }
    });
  }
}

inicializarTemaLogin();


/* ===== CONEXÃO SUPABASE ===== */

const cfg = window.SUPABASE_CONFIG || {};

const supabaseClient = supabase.createClient(
  cfg.url,
  cfg.key
);

const form = document.getElementById("login-form");
const erro = document.getElementById("erro-login");
const botao = document.getElementById("btn-login");


/* ===== VERIFICAR SESSÃO ===== */

async function verificarLogin() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    erro.textContent = "Não foi possível verificar a sessão.";
    return;
  }

  if (data.session) {
    window.location.replace("index.html");
  }
}


/* ===== REALIZAR LOGIN ===== */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  erro.textContent = "";
  botao.disabled = true;
  botao.textContent = "Entrando...";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
      });

    if (error) {
      erro.textContent = "E-mail ou senha incorretos.";
      return;
    }

    if (data.session) {
      window.location.replace("index.html");
    }

  } catch (e) {
    console.error(e);
    erro.textContent = "Erro de conexão. Tente novamente.";

  } finally {
    botao.disabled = false;
    botao.textContent = "Entrar no sistema";
  }
});


/* ===== INICIALIZAÇÃO ===== */

verificarLogin();
