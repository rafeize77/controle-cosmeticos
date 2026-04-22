const usuario = JSON.parse(localStorage.getItem("usuario"))

if (!usuario) {
    window.location.href = "login.html"
}

window.onload = () => {
    carregarUltimosItens();
};

// Preenche dados
document.getElementById("usuarioNome").innerText = usuario.nome
document.getElementById("dropdownNome").innerText = usuario.nome
document.getElementById("dropdownEmail").innerText = usuario.email

// Abrir/fechar menu
function toggleMenu(event) {
    event.stopPropagation()

    const menu = document.getElementById("dropdown")
    const seta = document.getElementById("seta")

    const aberto = menu.style.display === "block"

    menu.style.display = aberto ? "none" : "block"

    // gira a seta
    if (aberto) {
        seta.classList.remove("seta-ativa")
    } else {
        seta.classList.add("seta-ativa")
    }
}

// Fechar ao clicar fora
document.addEventListener("click", function() {
    document.getElementById("dropdown").style.display = "none"
})

// Logout
function logout() {
    localStorage.removeItem("usuario")
    window.location.href = "index.html"
}

function irProdutos(){
    window.location.href = "produtos.html"
}

function irEstoque(){
    window.location.href = "estoque.html"
}

// Listar últimos itens

async function carregarUltimosItens() {

    const lista = document.getElementById('ultimasMovimentacoes');
    lista.innerHTML = '';

    const { data, error } = await supabaseClient
        .from('movimentacao')
        .select(`
            quantidade,
            tipo_movimentacao,
            data_movimentacao,
            lote (
                numero_lote,
                produto (
                    nome
                )
            )
        `)
        .order('id_movimentacao', { ascending: false })
        .limit(3);

    if (error) {
        console.error(error);
        lista.innerHTML = '<li>Erro ao carregar</li>';
        return;
    }

    if (!data || data.length === 0) {
        lista.innerHTML = '<li>Nenhuma movimentação</li>';
        return;
    }

    data.forEach(item => {

        const produto = item.lote?.produto?.nome || 'Produto';
        const lote = item.lote?.numero_lote || 'Lote';

        let texto = '';

        if (item.tipo_movimentacao === 'entrada') {
            texto = `Adicionado ${item.quantidade} ao lote ${lote} (${produto})`;
        } else if (item.tipo_movimentacao === 'saida') {
            texto = `Removido ${item.quantidade} do lote ${lote} (${produto})`;
        }

        lista.innerHTML += `<li>${texto}</li>`;
    });
}
