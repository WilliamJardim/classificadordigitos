const dataset = new Dataset();

const editorCaracter = new Editor({
    resolucao: 256,
    top: 100,
    left: 900,
    titulo: 'Desenhe',
    backgroundColor: 'rgb(0,0,0)',

    //Configurações iniciais do cursor
    cursor: {
        color: 'rgb(255,255,255)',
        X: 0,
        Y: 0,
        width: 5,
        height: 5,
        insertionRate: 2, //Será inserido 5% do width e height do cursor na matrix, isso afeta a espessura de cada pixel 
        opacity: 0.4,
        forcaBorracha: 0.5
    },

    //Limita quais serão a faixa de valores dos pixels a serem desenhados
    limites: {
        crescimento: 1,
        decremento:  0
    },
    
    onEnviar: function( desenho ){
        dataset.insert( desenho );
        adicionarImagemNaLista(desenho);
    }

});

function adicionarImagemNaLista( desenho ){
   const visualizador = new Viewer( 'lista-dataset', 
                                    editorCaracter.getCursor(), 
                                    editorCaracter.config ); 
                                    
   visualizador.loadImage( desenho );
}

//Carrega um dataset
function carregarDataset( datasetArray = [] ){
    dataset.setDados(datasetArray);
    dataset.getDados().forEach(function( desenho ){
        adicionarImagemNaLista(desenho);
    })
}

//Carrega o dataset do LocalStorage
function carregarDatasetMemoria(){
    const dadosAtuais = JSON.parse( localStorage.getItem( 'dataset' ) );
    carregarDataset(dadosAtuais);
}

//Salva o dataset no LocalStorage e retorna o objeto
function salvarDataset(){
    const dadosAtuais = dataset.getDados();
    localStorage.setItem( 'dataset', JSON.stringify(dadosAtuais) )
    return dadosAtuais;
}

// Função para gerar e baixar o arquivo JSON
function baixarJSON(nomeArquivo = "dados.json") {
    // Converter o array em uma string JSON
    const jsonString = JSON.stringify( salvarDataset() , null, 2);

    // Criar um Blob com o JSON e definir o tipo de conteúdo
    const blob = new Blob([jsonString], { type: "application/json" });
  
    // Gerar uma URL temporária para o Blob
    const url = URL.createObjectURL(blob);
  
    // Criar um elemento <a> temporário para o download
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
  
    // Adicionar o elemento ao DOM e clicar nele para iniciar o download
    document.body.appendChild(a);
    a.click();
  
    // Remover o elemento do DOM
    document.body.removeChild(a);
  
    // Revogar a URL temporária para liberar memória
    URL.revokeObjectURL(url);
}

// Selecionar o elemento de upload
const inputJSON = document.getElementById("jsonUpload");
inputJSON.style.visibility = 'hidden';
inputJSON.style.display = 'none';

// Adicionar um ouvinte de eventos para quando um arquivo é selecionado
inputJSON.addEventListener("change", function(event) {
    const arquivo = event.target.files[0];

    // Verificar se o arquivo é válido e se tem a extensão .json
    if (arquivo && arquivo.type === "application/json") {
        const leitor = new FileReader();

        // Definir a função que executa quando o arquivo é lido
        leitor.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result); // Parse do conteúdo JSON
                carregarDataset(jsonData); // Chamar a função passando o JSON carregado
            } catch (error) {
                console.error("Erro ao analisar o arquivo JSON:", error);
                alert("Arquivo JSON inválido.");
            }
        };

        // Ler o arquivo como texto
        leitor.readAsText(arquivo);
        
    } else {
        alert("Por favor, selecione um arquivo JSON válido.");
    }
});

document.getElementById('botao-salvar-dataset').addEventListener("click", function(event) {
    baixarJSON();
});

document.getElementById('botao-abrir-dataset').addEventListener("click", function(event) {
    if( !inputJSON.aberto )
    {
        inputJSON.style.visibility = 'visible';
        inputJSON.style.display = 'block';
        inputJSON.aberto = true;
    }else{
        inputJSON.style.visibility = 'hidden';
        inputJSON.style.display = 'none';
        inputJSON.aberto = false;
    }
});