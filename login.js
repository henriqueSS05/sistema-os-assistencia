
const cfg = window.SUPABASE_CONFIG || {};

const supabaseClient = supabase.createClient(
  cfg.url,
  cfg.key
);

const form = document.getElementById("login-form");
const erro = document.getElementById("erro-login");
const botao = document.getElementById("btn-login");

// Se já estiver conectado, vai direto para o sistema.
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

verificarLogin();
