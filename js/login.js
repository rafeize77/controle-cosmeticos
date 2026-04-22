
// Alternar telas
function mostrarFormularioCadastro() {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-cadastro').style.display = 'block';
}

function mostrarFormularioLogin() {
    document.getElementById('form-cadastro').style.display = 'none';
    document.getElementById('form-login').style.display = 'block';
}

// CADASTRO
document.getElementById("cadastro").addEventListener("submit", async function(e){
    e.preventDefault();

    const nome = document.getElementById("nome-cadastro").value;
    const email = document.getElementById("email-cadastro").value;
    const senha = document.getElementById("senha-cadastro").value;

        const { error } = await supabaseClient
        .from('usuario')
        .insert([{
            nome: nome,
            email: email,
            senha: senha
        }]);

    if(error){
        alert("Erro ao cadastrar.");
    } else {
        alert("Cadastro realizado!");
        mostrarFormularioLogin();
    }
});

// LOGIN
document.getElementById("login").addEventListener("submit", async function(e){
    e.preventDefault();

    const email = document.getElementById("email-login").value;
    const senha = document.getElementById("senha-login").value;

    const { data, error } = await supabaseClient
        .from('usuario')
        .select('*')
        .eq('email', email)
        .eq('senha', senha);

    if(error){
        alert("Erro no sistema");
        return;
    }

    if(data.length > 0){
        localStorage.setItem("usuario", JSON.stringify(data[0]));
        window.location.href = "home.html";
    } else {
        alert("Email ou senha incorretos!");
    }
});
