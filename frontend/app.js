const API_URL = 'http://localhost:3000';

// Elementos
const productsGrid = document.getElementById('products-grid');
const modal = document.getElementById('modal');
const btnNovoProduto = document.getElementById('btn-novo-produto');
const closeBtn = document.querySelector('.close-btn');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');

// Inicialização
document.addEventListener('DOMContentLoaded', carregarProdutos);

// Eventos
btnNovoProduto.addEventListener('click', () => abrirModal());
closeBtn.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModal();
});

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarProduto();
});

// Funções
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        
        // Suporte ao formato com .dados ou array direto
        const produtos = data.dados || data;

        renderizarProdutos(produtos);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        productsGrid.innerHTML = '<p style="grid-column: span 3; text-align: center; color: red;">Não foi possível conectar com a API. Verifique se o servidor Node está rodando.</p>';
    }
}

function renderizarProdutos(produtos) {
    productsGrid.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: span 3; text-align: center; color: #666;">Nenhum produto cadastrado na base de dados.</p>';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let imgHtml = '<div class="card-img-placeholder">Sem Imagem</div>';
        if (produto.imagem) {
            // A API já envia com /public/
            imgHtml = `<img src="${API_URL}${produto.imagem}" alt="${produto.nome}">`;
        }

        const precoFormatado = Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        card.innerHTML = `
            <div class="card-img-container">
                ${imgHtml}
            </div>
            <div class="card-content">
                <h3 class="card-title">${produto.nome}</h3>
                <p class="card-desc">${produto.descricao}</p>
                <div class="card-price">${precoFormatado}</div>
                <div class="card-actions">
                    <button class="btn edit" onclick="editarProduto(${produto.id})">Editar</button>
                    <button class="btn danger" onclick="excluirProduto(${produto.id})">Excluir</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function abrirModal(produto = null) {
    const idInput = document.getElementById('produto-id');
    const nomeInput = document.getElementById('nome');
    const descInput = document.getElementById('descricao');
    const precoInput = document.getElementById('preco');
    const catInput = document.getElementById('categoria');
    const dispInput = document.getElementById('disponivel');

    productForm.reset();
    
    if (produto) {
        modalTitle.textContent = 'Editar Produto';
        idInput.value = produto.id;
        nomeInput.value = produto.nome;
        descInput.value = produto.descricao;
        precoInput.value = produto.preco;
        catInput.value = produto.categoria || '';
        dispInput.checked = produto.disponivel;
    } else {
        modalTitle.textContent = 'Cadastrar Produto';
        idInput.value = '';
    }

    modal.classList.remove('hidden');
}

function fecharModal() {
    modal.classList.add('hidden');
}

async function salvarProduto() {
    const id = document.getElementById('produto-id').value;
    const isEdit = !!id;
    
    const formData = new FormData();
    formData.append('nome', document.getElementById('nome').value);
    formData.append('descricao', document.getElementById('descricao').value);
    formData.append('preco', document.getElementById('preco').value);
    formData.append('categoria', document.getElementById('categoria').value);
    formData.append('disponivel', document.getElementById('disponivel').checked);
    
    const fileInput = document.getElementById('imagem');
    if (fileInput.files.length > 0) {
        formData.append('imagem', fileInput.files[0]);
    }

    const url = isEdit ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const data = await response.json();
        if (response.ok || data.sucesso) {
            fecharModal();
            carregarProdutos();
        } else {
            alert("Erro: " + (data.mensagem || data.erro || "Desconhecido"));
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro de conexão ao tentar salvar.");
    }
}

window.editarProduto = async function(id) {
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`);
        const data = await response.json();
        const produto = data.dados || data;
        abrirModal(produto);
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
    }
}

window.excluirProduto = async function(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
        try {
            const response = await fetch(`${API_URL}/produtos/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                carregarProdutos();
            } else {
                const data = await response.json();
                alert("Erro ao excluir: " + (data.mensagem || data.erro));
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    }
}
