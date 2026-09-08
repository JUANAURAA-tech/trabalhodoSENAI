let producoes = JSON.parse(localStorage.getItem("producao")) || [];
let estoque = JSON.parse(localStorage.getItem("estoque")) || {};
let receitas = JSON.parse(localStorage.getItem("receitas")) || {};
let receitaEmMontagem = {};

localStorage.setItem("producao", JSON.stringify(producoes));
localStorage.setItem("estoque", JSON.stringify(estoque));
localStorage.setItem("receitas", JSON.stringify(receitas));

inicializarReceitas();
mostrar();

function inicializarReceitas(){
    let seletorSubproduto = document.getElementById("subproduto-receita");
    let opcoesMateriais = document.querySelectorAll("#lista-materiais option");

    opcoesMateriais.forEach(function(opcao){
        let option = document.createElement("option");
        option.value = opcao.value;
        option.textContent = opcao.value;
        seletorSubproduto.appendChild(option);
    });

    mostrarReceitas();
}

function adicionarSubproduto(){
    let subproduto = document.getElementById("subproduto-receita").value;
    let quantidade = Number(document.getElementById("quantidade-receita").value);

    if(subproduto == "" || !Number.isFinite(quantidade) || quantidade <= 0){
        alert("Informe o subproduto e uma quantidade válida.");
        return;
    }

    receitaEmMontagem[subproduto] = (Number(receitaEmMontagem[subproduto]) || 0) + quantidade;
    mostrarReceitaEmMontagem();
    document.getElementById("subproduto-receita").value = "";
    document.getElementById("quantidade-receita").value = "";
}

function mostrarReceitaEmMontagem(){
    let lista = document.getElementById("receita-em-montagem");
    let subprodutos = Object.keys(receitaEmMontagem);

    if(subprodutos.length == 0){
        lista.innerHTML = "";
        return;
    }

    lista.innerHTML = "<strong>Subprodutos da receita:</strong> " + subprodutos.map(function(subproduto){
        return subproduto + " (" + receitaEmMontagem[subproduto] + ")";
    }).join(", ");
}

function salvarReceita(){
    let produto = document.getElementById("produto-receita").value.trim();

    if(produto == "" || Object.keys(receitaEmMontagem).length == 0){
        alert("Informe o produto final e adicione pelo menos um subproduto.");
        return;
    }

    receitas[produto] = Object.assign({}, receitaEmMontagem);
    localStorage.setItem("receitas", JSON.stringify(receitas));
    receitaEmMontagem = {};
    document.getElementById("produto-receita").value = "";
    mostrarReceitaEmMontagem();
    mostrarReceitas();
}

function mostrarReceitas(){
    let tabelaReceitas = document.getElementById("tabela-receitas");

    if(!tabelaReceitas){
        return;
    }

    tabelaReceitas.innerHTML = "";

    Object.keys(receitas).forEach(function(produto){
        let linha = document.createElement("tr");
        let produtoCell = document.createElement("td");
        let composicaoCell = document.createElement("td");
        let acaoCell = document.createElement("td");
        let botaoExcluir = document.createElement("button");

        produtoCell.textContent = produto;
        composicaoCell.textContent = Object.keys(receitas[produto]).map(function(subproduto){
            return subproduto + ": " + receitas[produto][subproduto];
        }).join(", ");
        botaoExcluir.className = "btn-salvar";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.onclick = function(){ excluirReceita(produto); };

        acaoCell.appendChild(botaoExcluir);
        linha.appendChild(produtoCell);
        linha.appendChild(composicaoCell);
        linha.appendChild(acaoCell);
        tabelaReceitas.appendChild(linha);
    });
}

function excluirReceita(produto){
    if(!confirm("Excluir a receita de " + produto + "?")){
        return;
    }

    delete receitas[produto];
    localStorage.setItem("receitas", JSON.stringify(receitas));
    mostrarReceitas();
}

function salvar(){

    let material = document.getElementById("material").value;

    let quantidade = document.getElementById("quantidade").value;

    let data = document.getElementById("data").value;

    let turno = document.getElementById("turno").value;

    let quantidadeNumerica = Number(quantidade);

    if(material=="" || quantidade=="" || data=="" || !Number.isFinite(quantidadeNumerica) || quantidadeNumerica <= 0){
        alert("Preencha todos os campos.");
        return;
    }

    let receita = receitas[material];

    if(receita){
        for(let insumo in receita){
            let quantidadeNecessaria = Number(receita[insumo]) * quantidadeNumerica;
            let saldoAtual = Number(estoque[insumo]) || 0;

            if(saldoAtual < quantidadeNecessaria){
                alert("Estoque insuficiente de insumos para produzir este item.");
                return;
            }
        }

        for(let insumo in receita){
            let quantidadeNecessaria = Number(receita[insumo]) * quantidadeNumerica;
            estoque[insumo] -= quantidadeNecessaria;
        }
    }

    estoque[material] = (Number(estoque[material]) || 0) + quantidadeNumerica;

    let producao = {
        material,
        quantidade,
        data,
        turno
    };

    producoes.push(producao);

    localStorage.setItem("producao", JSON.stringify(producoes));
    localStorage.setItem("estoque", JSON.stringify(estoque));

    mostrar();

    document.getElementById("material").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("data").value = "";
}


function mostrar(){

    let tabela = document.getElementById("tabela");
    let filtroMes = document.getElementById("filtro-mes").value;
    let producoesExibidas = producoes
        .map(function(item, index){
            return { item, index };
        })
        .filter(function(registro){
            return filtroMes == "" || registro.item.data.startsWith(filtroMes);
        });

    tabela.innerHTML = "";
    producoesExibidas.sort(function(a, b){
        return new Date(a.item.data) - new Date(b.item.data);
    })

    let totalProduzido = producoesExibidas.reduce(function(total, registro){
        return total + Number(registro.item.quantidade);
    }, 0);
    document.getElementById("total-produzido").textContent = totalProduzido;

    producoesExibidas.forEach(function(registro){
        let item = registro.item;

        tabela.innerHTML += `
        <tr>
            <td>${item.material}</td>
            <td>${item.quantidade}</td>
            <td>${item.data}</td>
            <td>${item.turno}</td>
            <td>${Number(estoque[item.material]) || 0}</td>
            <td>
                <button onclick="apagarItem(${registro.index})">Apagar</button>
            </td>
        </tr>
        `;

    });

}
function filtrarPorMes(){
    mostrar();
}

function desfazerMovimentacao(producao){
    let quantidade = Number(producao.quantidade);
    let receita = receitas[producao.material];

    estoque[producao.material] = (Number(estoque[producao.material]) || 0) - quantidade;

    if(receita){
        for(let insumo in receita){
            let quantidadeConsumida = Number(receita[insumo]) * quantidade;
            estoque[insumo] = (Number(estoque[insumo]) || 0) + quantidadeConsumida;
        }
    }
}

function apagarItem(index){ 
    let producao = producoes[index];

    desfazerMovimentacao(producao);
    producoes.splice(index, 1);
    localStorage.setItem("producao", JSON.stringify(producoes));
    localStorage.setItem("estoque", JSON.stringify(estoque));
    mostrar();
}