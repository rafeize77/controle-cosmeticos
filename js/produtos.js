// CONFIG INICIAL

let produtoEditando = null;

// USUÁRIO / SESSÃO

function carregarUsuario() {
    const user = JSON.parse(localStorage.getItem('usuario'));

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userNome').innerText = user.nome;
    document.getElementById('userNomeDrop').innerText = user.nome;
    document.getElementById('userEmail').innerText = user.email;
}


// DROPDOWN

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    const seta = document.getElementById('seta');

    dropdown.style.display =
        dropdown.style.display === 'block' ? 'none' : 'block';

    seta.classList.toggle('seta-ativa');
}


// LOGOUT

function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}


// CARREGAR PRODUTOS

async function carregarProdutos() {
    const { data, error } = await supabaseClient
        .from('produto')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error(error);
        alert('Erro ao carregar produtos');
        return;
    }

    renderizarTabela(data);
}


// RENDERIZAR TABELA

function renderizarTabela(produtos) {
    const tabela = document.getElementById('tabelaProdutos');
    tabela.innerHTML = '';

    if (produtos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="5">Nenhum produto encontrado</td></tr>`;
        return;
    }

    produtos.forEach(produto => {
        tabela.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.categoria}</td>
                <td>${produto.marca}</td>
                <td>${produto.quantidade_minima}</td>
                <td>
                    <button class="edit" onclick="editarProduto(${produto.id_produto})">✏️</button>
                    <button class="delete" onclick="excluirProduto(${produto.id_produto})">🗑️</button>
                </td>
            </tr>
        `;
    });
}


// SALVAR (CREATE / UPDATE)

async function salvarProduto() {
    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const quantidade_minima = document.getElementById('quantidade_minima').value;

    // VALIDAÇÃO
    if (!nome || !categoria || !marca || !quantidade_minima) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        if (produtoEditando) {
            // UPDATE
            const { error } = await supabaseClient
                .from('produto')
                .update({
                    nome,
                    categoria,
                    marca,
                    quantidade_minima
                })
                .eq('id_produto', produtoEditando);

            if (error) throw error;

            produtoEditando = null;
            alterarBotao(false);

        } else {
            // INSERT
            const { error } = await supabaseClient
                .from('produto')
                .insert([{
                    nome,
                    categoria,
                    marca,
                    quantidade_minima
                }]);

            if (error) throw error;
        }

        limparFormulario();
        carregarProdutos();

    } catch (err) {
        console.error(err);
        alert('Erro ao salvar produto');
    }
}


// EDITAR

async function editarProduto(id) {
    const { data, error } = await supabaseClient
        .from('produto')
        .select('*')
        .eq('id_produto', id)
        .single();

    if (error) {
        console.error(error);
        alert('Erro ao carregar produto');
        return;
    }

    document.getElementById('nome').value = data.nome;
    document.getElementById('categoria').value = data.categoria;
    document.getElementById('marca').value = data.marca;
    document.getElementById('quantidade_minima').value = data.quantidade_minima;

    produtoEditando = id;
    alterarBotao(true);
}


// EXCLUIR

async function excluirProduto(id) {

    const { error } = await supabaseClient
        .from('produto')
        .delete()
        .eq('id_produto', id);

    if (error) {
        console.error(error);
        alert('Erro ao excluir');
        return;
    }

    carregarProdutos();
}


// BUSCA

async function buscarProdutos(termo) {
    const { data, error } = await supabaseClient
        .from('produto')
        .select('*')
        .ilike('nome', `%${termo}%`)
        .order('nome', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    renderizarTabela(data);
}

// EVENTO DO INPUT
document.getElementById('searchInput').addEventListener('input', (e) => {
    buscarProdutos(e.target.value);
});


// UTILITÁRIOS

function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('quantidade_minima').value = '';
}

function alterarBotao(editando) {
    const btn = document.querySelector('.form-card button');

    if (editando) {
        btn.innerText = 'Atualizar Produto';
    } else {
        btn.innerText = 'Salvar Produto';
    }
}


// INIT

window.onload = () => {
    carregarUsuario();
    carregarProdutos();
};
