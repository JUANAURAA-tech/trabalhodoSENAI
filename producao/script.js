let producoes = JSON.parse(localStorage.getItem("producao")) || [];

mostrar();

function salvar(){

    let material = document.getElementById("material").value;

    let quantidade = document.getElementById("quantidade").value;

    let data = document.getElementById("data").value;

    let turno = document.getElementById("turno").value;

    if(material=="" || quantidade=="" || data==""){
        alert("Preencha todos os campos.");
        return;
    }

    let producao = {
        material,
        quantidade,
        data,
        turno
    };

    producoes.push(producao);

    localStorage.setItem("producao", JSON.stringify(producoes));

    mostrar();

    document.getElementById("material").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("data").value = "";
}


function mostrar(){

    let tabela = document.getElementById("tabela");

    tabela.innerHTML = "";
    producoes.sort(function(a, b){
        return new Date(a.data) - new Date(b.data);
    })

    producoes.forEach(function(item, index){

        tabela.innerHTML += `
        <tr>
            <td>${item.material}</td>
            <td>${item.quantidade}</td>
            <td>${item.data}</td>
            <td>${item.turno}</td>
            <td>
                <button onclick="apagarItem(${index})">Apagar</button>
            </td>
        </tr>
        `;

    });

}
function apagarItem(index){ 
    producoes.splice(index, 1); // Apaga o item da lista
    localStorage.setItem("producao", JSON.stringify(producoes)); // Atualiza o localStorage
    mostrar(); // Renderiza a tabela de novo
}