// USUÁRIO

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

// PRODUTOS

async function carregarProdutos() {

   const loteSelect = document.getElementById('loteSelect'); 
   loteSelect.innerHTML = '<option value="">Selecione um lote</option>';

    const { data, error } = await supabaseClient
        .from('produto')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error(error);
        alert('Erro ao carregar produtos');
        return;
    }

    const produtoSelect = document.getElementById('produtoSelect');
    produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';

    data.forEach(produto => {
        produtoSelect.innerHTML += `
    <option value="${produto.id_produto}">
        ${produto.nome}
    </option>
          `;
    });
}

// Verificação de estoque mínimo

async function verificarEstoqueMinimo() {

    const { data: produtos, error } = await supabaseClient
        .from('produto')
        .select('id_produto, nome, quantidade_minima');

    if (error) {
        console.error('Erro ao buscar produtos', error);
        return;
    }

    let alertas = [];

    for (const produto of produtos) {

        const { data: lotes } = await supabaseClient
            .from('lote')
            .select('quantidade_atual')
            .eq('id_produto', produto.id_produto);

        let total = 0;

        lotes.forEach(l => total += l.quantidade_atual);

        if (total <= produto.quantidade_minima) {
            alertas.push(`🔴 ${produto.nome} (Estoque: ${total})`);
        }
    }

    if (alertas.length > 0) {
        alert('⚠️ ESTOQUE BAIXO:\n\n' + alertas.join('\n'));
    }
}


async function carregarLotes(idProduto) {

    const select = document.getElementById('loteSelect');
    const camposEntrada = document.getElementById('camposEntrada');
    const tipoLote = document.getElementById('tipoLote');

    select.innerHTML = '<option value="">Selecione um lote</option>';
    select.disabled = false;

    const { data, error } = await supabaseClient
        .from('lote')
        .select('*')
        .eq('id_produto', idProduto)
        .order('data_validade', { ascending: true });

        window.temLote = data && data.length > 0;

    if (error) {
        console.error(error);
        alert('Erro ao carregar lotes');
        return;
    }

    // NÃO TEM LOTES
   const areaTipoLote = document.getElementById('areaTipoLote');

    if (!data || data.length === 0) {

    select.innerHTML = '<option value="">Nenhum lote encontrado</option>';
    select.disabled = true;

    tipoLote.value = 'novo';
    camposEntrada.classList.add('show');

    // esconde tipo de lote
    areaTipoLote.classList.remove('show');

    // libera movimentação
    document.getElementById('areaMovimentacao').classList.add('show');

    return;
    }

    // TEM LOTES
    tipoLote.value = 'existente';
    camposEntrada.classList.remove('show');

    let loteMaisProximo = null;

    data.forEach(lote => {
        if (!loteMaisProximo || new Date(lote.data_validade) < new Date(loteMaisProximo.data_validade)) {
            loteMaisProximo = lote;
        }
    });

    data.forEach(lote => {
        let destaque = '';

        if (lote.id_lote === loteMaisProximo.id_lote) {
            destaque = '⚠️';
        }

        if (new Date(lote.data_validade) < new Date()) {
            destaque = '🔴';
        }

        select.innerHTML += `
            <option value="${lote.id_lote}">
                ${destaque} Lote ${lote.numero_lote}
            </option>
        `;
    });
}

// formatar data

function formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

function limparLotes() {
    const select = document.getElementById('loteSelect');
    select.innerHTML = '<option value="">Selecione um lote</option>';
}

// INIT

window.onload = () => {
    carregarUsuario();
    carregarProdutos();
    verificarEstoqueMinimo().catch(console.error);

    document.getElementById('areaTipoLote').classList.remove('show');
    document.getElementById('camposEntrada').classList.remove('show');

    const areaLote = document.getElementById('areaLote');
    const areaMov = document.getElementById('areaMovimentacao');
    const camposEntrada = document.getElementById('camposEntrada');

    // Função para carregar lotes do produto selecionado

    const select = document.getElementById('loteSelect');

    // RESET GERAL (IMPORTANTÍSSIMO)
  select.disabled = false;
  document.getElementById('tipoLote').disabled = false;
    // PRODUTO → mostra LOTE
    document.getElementById('produtoSelect').addEventListener('change', (e) => {
        const idProduto = e.target.value;

        if (!idProduto) {
         
        limparLotes();

            areaLote.classList.remove('show');
            areaMov.classList.remove('show');
            return;
        }

        carregarLotes(idProduto);

        areaLote.classList.add('show');
    });

    // LOTE → mostra MOVIMENTAÇÃO
document.getElementById('loteSelect').addEventListener('change', async (e) => {

    const idLote = e.target.value;
    const detalhes = document.getElementById('detalhesLote');

        // SEM LOTE SELECIONADO
        if (!idLote) {

        // só esconde se NÃO estiver criando novo lote
        const tipoLote = document.getElementById('tipoLote').value;

        if (tipoLote !== 'novo') {
        areaMov.classList.remove('show');
        }

        document.getElementById('detalhesLote').classList.add('hidden');

        return;

        // ESCONDE
        detalhes.classList.add('hidden');

        // LIMPA OS DADOS
        document.getElementById('detNumero').innerText = '';
        document.getElementById('detValidade').innerText = '';
        document.getElementById('detQuantidade').innerText = '';

        return;
    }

    // COM LOTE
    areaMov.classList.add('show');

    const { data: lote, error } = await supabaseClient
        .from('lote')
        .select('*')
        .eq('id_lote', idLote)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    document.getElementById('detNumero').innerText = lote.numero_lote;
    document.getElementById('detValidade').innerText = formatarData(lote.data_validade);
    document.getElementById('detQuantidade').innerText = lote.quantidade_atual;

    detalhes.classList.remove('hidden');
});

    // TIPO MOVIMENTAÇÃO
    document.getElementById('tipoMovimentacao').addEventListener('change', (e) => {
    const tipo = e.target.value;

    const areaTipoLote = document.getElementById('areaTipoLote');
    const camposEntrada = document.getElementById('camposEntrada');

    if (tipo === 'entrada') {

    // só mostra se EXISTIR lote
    if (window.temLote) {
        areaTipoLote.classList.add('show');
    } else {
        areaTipoLote.classList.remove('show');
    }
}
        else if (tipo === 'saida') {
        // esconde tudo relacionado a criação de lote
        areaTipoLote.classList.remove('show');
        camposEntrada.classList.remove('show');

        // força usar lote existente
        document.getElementById('tipoLote').value = 'existente';
        document.getElementById('loteSelect').disabled = false;
    }

});

    // TIPO DE LOTE
    document.getElementById('tipoLote').addEventListener('change', (e) => {
    const tipo = e.target.value;
    const camposEntrada = document.getElementById('camposEntrada');

    if (tipo === 'novo') {
        camposEntrada.classList.add('show');
    } else {
        camposEntrada.classList.remove('show');
    }
});
};

// Função principal 

async function registrarMovimentacao() {
    const idProduto = document.getElementById('produtoSelect').value;
    const idLote = document.getElementById('loteSelect').value;
    const tipo = document.getElementById('tipoMovimentacao').value;
    const quantidade = parseInt(document.getElementById('quantidadeMov').value);
    let tipoLote = document.getElementById('tipoLote').value;

// Se não existe lote selecionado → força novo
if (!idLote) {
    tipoLote = 'novo';
}
    

// Validação básica    
    if (!idProduto || !tipo || !quantidade || quantidade <= 0) {
    alert('Preencha os campos corretamente');
    return;
}

    const numeroLote = document.getElementById('numeroLote').value;
    const dataValidade = document.getElementById('dataValidade').value;

    // valida tipo de lote
    if (tipo === 'entrada' && !tipoLote) {
        alert('Selecione o tipo de lote');
        return;
    }

    // SAÍDA → precisa de lote
    if (tipo === 'saida' && !idLote) {
        alert('Selecione um lote');
        return;
    }

    // ENTRADA → lote existente precisa de lote
    if (tipo === 'entrada' && tipoLote === 'existente' && !idLote) {
        alert('Selecione um lote existente');
        return;
    }

    // ENTRADA → lote novo precisa de dados
    if (tipo === 'entrada' && tipoLote === 'novo') {
        if (!numeroLote || !dataValidade) {
            alert('Preencha lote e validade');
            return;
        }
    }

    let sucesso = false;

    // ENTRADA
    if (tipo === 'entrada') {

        if (tipoLote === 'existente') {
            sucesso = await entradaLoteExistente(idLote, quantidade);
        }

        if (tipoLote === 'novo') {
            sucesso = await criarNovoLote(idProduto, numeroLote, dataValidade, quantidade);
        }
    }

    // SAÍDA
    if (tipo === 'saida') {
        sucesso = await saidaEstoque(idLote, quantidade);
    }

    // bloqueia sucesso falso
    if (!sucesso) return;

    if (tipo === 'entrada' && tipoLote === 'novo') {
    alert(' Novo lote criado com sucesso!');
} else if (tipo === 'entrada') {
    alert(' Entrada registrada!');
} else {
    alert(' Saída registrada!');
}
    await carregarLotes(idProduto);
    await verificarEstoqueMinimo();
}

// Limpar formulário

function limparFormularioMovimentacao() {
    document.getElementById('quantidadeMov').value = '';
    document.getElementById('numeroLote').value = '';
    document.getElementById('dataValidade').value = '';
}

// Saída de estoque

async function saidaEstoque(idLote, quantidade) {

    if (!idLote) {
        alert('Selecione um lote');
        return false;
    }

    const { data: lote } = await supabaseClient
        .from('lote')
        .select('*')
        .eq('id_lote', idLote)
        .single();

    if (quantidade > lote.quantidade_atual) {
        alert('Estoque insuficiente');
        return false;
    }

    await supabaseClient
        .from('lote')
        .update({
            quantidade_atual: lote.quantidade_atual - quantidade
        })
        .eq('id_lote', idLote);

        await supabaseClient
    .from('movimentacao')
    .insert([{
        id_lote: idLote,
        id_usuario: JSON.parse(localStorage.getItem('usuario')).id_usuario,
        tipo_movimentacao: 'saida',
        quantidade: quantidade,
        data_movimentacao: new Date().toISOString()
    }]);

    return true;
}

// Somar em lotes existentes

async function entradaLoteExistente(idLote, quantidade) {

    if (!idLote) {
        alert('Selecione um lote');
        return false;
    }

    const { data: lote } = await supabaseClient
        .from('lote')
        .select('*')
        .eq('id_lote', idLote)
        .single();

    await supabaseClient
        .from('lote')
        .update({
            quantidade_atual: lote.quantidade_atual + quantidade
        })
        .eq('id_lote', idLote);

        await supabaseClient
        .from('movimentacao')
        .insert([{
        id_lote: idLote,
        id_usuario: JSON.parse(localStorage.getItem('usuario')).id_usuario,
        tipo_movimentacao: 'entrada',
        quantidade: quantidade,
        data_movimentacao: new Date().toISOString()
    }]);

    return true;
}

//Criação de novo lote

async function criarNovoLote(idProduto, numeroLote, dataValidade, quantidade) {

    const { data, error } = await supabaseClient
        .from('lote')
        .insert([{
            id_produto: idProduto,
            numero_lote: numeroLote,
            data_validade: dataValidade,
            quantidade_atual: quantidade
        }])
        .select();

    if (error) {
        console.error(error);
        alert('Erro ao criar lote');
        return false;
    }

    const idLoteNovo = data[0].id_lote;

    // REGISTRA MOVIMENTAÇÃO
    await supabaseClient
        .from('movimentacao')
        .insert([{
            id_lote: idLoteNovo,
            id_usuario: JSON.parse(localStorage.getItem('usuario')).id_usuario,
            tipo_movimentacao: 'entrada',
            quantidade: quantidade,
            data_movimentacao: new Date().toISOString()
        }]);

    return true;
}
