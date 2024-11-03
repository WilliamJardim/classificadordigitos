const dataset        = new Dataset();

const dadosCursor    = {
    color: 'rgb(255,255,255)',
    X: 0,
    Y: 0,
    width: 5,
    height: 5,
    insertionRate: 2, //Será inserido 5% do width e height do cursor na matrix, isso afeta a espessura de cada pixel 
    opacity: 0.4,
    forcaBorracha: 0.5
};

const configEditor = {
    //Limita quais serão a faixa de valores dos pixels a serem desenhados
    limites: {
        crescimento: 1,
        decremento:  0
    }
}

const editorCaracter = null;

function adicionarImagemNaLista( desenho, cursor )
{
   const visualizador = new Viewer( 'lista-dataset',
                                    '',
                                    [],
                                    cursor, 
                                    configEditor ); 
                                    
   visualizador.loadImage( desenho );
}

//Carrega um dataset
function carregarDataset( datasetArray = [], cursor ){
    dataset.setDados(datasetArray);
    dataset.getDados().forEach(function( desenho ){
        adicionarImagemNaLista(desenho, cursor);
    })
}

//Carrega o dataset do LocalStorage
function carregarDatasetMemoria(){
    const dadosAtuais = JSON.parse( localStorage.getItem( 'dataset' ) );
    carregarDataset(dadosAtuais, editorCaracter);
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
            
                const jsonData = JSON.parse(e.target.result); // Parse do conteúdo JSON
                carregarDataset(jsonData, dadosCursor); // Chamar a função passando o JSON carregado

           
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

/**
* Redimenciona uma matrix
* Por exemplo, Ao receber uma imagem em preto e branco em forma de matrix 500x500, podemos obter uma nova matrix equivalente porém na resoluçao 100x100, 
* Com exatamente o mesmo conteudo só que convertido para uma resolução menor
* 
* @param {*} matrix 
* @param {*} oldSize 
* @param {*} newSize 
* @returns 
*/
function redimencionarDesenho(matrix, oldSize, newSize) {
    const scale = oldSize / newSize;
    const newMatrix = Array.from({ length: newSize }, () => Array(newSize).fill(0));

    for (let i = 0; i < newSize; i++) {
        for (let j = 0; j < newSize; j++) {
            let sum = 0;

            // Calcula a média dos pixels no bloco 5x5
            for (let x = 0; x < scale; x++) {
                for (let y = 0; y < scale; y++) {
                    sum += matrix[i * scale + x][j * scale + y];
                }
            }

            // Atribui a média para a posição (i, j) na nova matriz
            newMatrix[i][j] = sum / (scale * scale);
        }
    }

    return newMatrix;
}

function planificarDesenho( desenho ){
    let desenhoPlanificado = [];

    redimencionarDesenho(desenho, 256, 64).forEach(( linha )=>{
        linha.forEach((numero)=>{
            //Não aceita valores decimais, converte tudo para inteiro 0 ou 1
            desenhoPlanificado.push( (numero > 0 ? 1 : 0) );
        });
    });

    return desenhoPlanificado;
}

var pesosInicias = null;
var pesosFinais  = null;

function treinarModelo(){
    const valorEpocas         = document.getElementById('campo-epocas').value;
    const valorEpocasMostrar  = document.getElementById('campo-epocas-mostrar').value;
    const valorAprendizado    = Number( document.getElementById('campo-taxa-aprendizado').value.replace(',','.') );

    if( window.confirm('Deseja iniciar o treinamento( SIM/NAO ) ??? Isso pode demorar um pouco!') == false ){
        console.log('cancelado');
        return;
    }

    // Estrutura da rede: 65536 unidades na entrada, 2 unidades na camada oculta, e 1 na saída
    const mlpConfig = {
        layers: [
            { type: LayerType.Input,  inputs: 4096,   units: 4096 }, //Aqui são apenas 65536 entradas, preciso melhorar esse método
            { type: LayerType.Hidden, inputs: 4096,   units: 4, functions: Array(4).fill('Sigmoid')  }, 
            { type: LayerType.Final,  inputs: 4,      units: 3, functions: [ 'Sigmoid', 'Sigmoid', 'Sigmoid' ]  }
        ],
        initialization: Initialization.Random
    };

    window.mlp = new MLP(mlpConfig);
    window.pesosInicias = mlp.initialParameters;

    // Dados de entrada para o problema XOR
    const inputs = dataset.getDados().map( (desenho)=>{ 
        return planificarDesenho(desenho);
    });

    //Gerar os rótulos
    const targets = [
        [1,0,0],
        [0,1,0],
        [0,0,1]
    ]

    
    // Treinando a rede
    mlp.train(inputs, targets, valorAprendizado, valorEpocas, valorEpocasMostrar);

    window.pesosFinais = mlp.exportParameters();

    alert('Treinamento concluido!');

    return mlp;
}

function extenderTreinamento(){
    const valorEpocas         = document.getElementById('campo-epocas').value;
    const valorEpocasMostrar  = document.getElementById('campo-epocas-mostrar').value;
    const valorAprendizado    = Number( document.getElementById('campo-taxa-aprendizado').value.replace(',','.') );

    if(!window.mlp){
        alert('MODELO NÂO FOI INICIADO!');
        return;
    }

    // Dados de entrada para o problema XOR
    const inputs = dataset.getDados().map( (desenho)=>{ 
        return planificarDesenho(desenho);
    });

    //Gerar os rótulos
    const targets = [
        [1,0,0],
        [0,1,0],
        [0,0,1]
    ]

    // Treinando a rede (USANDO A MESMA INSTANCIA DO MODELO)
    mlp.train(inputs, targets, valorAprendizado, valorEpocas, valorEpocasMostrar);

    window.pesosFinais = mlp.exportParameters();

    alert('Treinamento concluido!');
}

function medirPrecisaoTreino( instancia, dadosDataset, osTargets ){
    const acertosAmostrasTreino = Array( osTargets[0].length ).fill(0); 

    dadosDataset.forEach(function( desenho, indiceDesenho ){
        const estimativa     = instancia.forward( planificarDesenho( desenho ) );
        const alvos          = osTargets[ indiceDesenho ];
        //const acertosPorTipo = Array( alvos.length ).fill(null);

        //Para cada tipo de classe
        for( let tipo = 0 ; tipo < alvos.length ; tipo++ )
        {
            const tipoAtual = alvos[tipo];
            acertosAmostrasTreino[ tipo ] += Math.sqrt(Math.pow( (estimativa[tipo] - tipoAtual), 2));
        }

        
    });

    return acertosAmostrasTreino.map((v)=>{ return v / dadosDataset.length });
}

document.getElementById('botao-adicionar-desenho').addEventListener('click', function(){
    window.editorCaracter = new Editor({
        resolucao: 256,
        top: 100,
        left: 900,
        titulo: 'Desenhe',
        backgroundColor: 'rgb(0,0,0)',
    
        //Configurações iniciais do cursor
        cursor: {...dadosCursor},
    
        //Limita quais serão a faixa de valores dos pixels a serem desenhados
        limites: configEditor.limites,
        
        onEnviar: function( desenho ){
            dataset.insert( desenho );
            adicionarImagemNaLista( desenho, this.getCursor() );
            this.deletarInstancia();
        }
    
    });
})

document.getElementById('botao-testar-modelo').addEventListener('click', function(){

    if(!window.mlp){
        alert('MODELO NÂO FOI TREINADO!');
        return;
    }

    //document.getElementById('resultados-testes').innerHTML = '';

    const editorTeste = new Editor({
        resolucao: 256,
        top: 100,
        left: 900,
        titulo: 'Desenhe',
        backgroundColor: 'rgb(0,0,0)',
    
        //Configurações iniciais do cursor
        cursor: {...dadosCursor},
    
        //Limita quais serão a faixa de valores dos pixels a serem desenhados
        limites: configEditor.limites,
        
        onEnviar: function( desenhoTeste ){
            const estimativa = window.mlp.forward( planificarDesenho( desenhoTeste ) );

            console.log('RESULTADO ESTIMADO', estimativa);

            const visualizador = new Viewer( 'resultados-testes',
                                             'RESULTADO ESTIMADO', 
                                             estimativa,
                                             dadosCursor, 
                                             configEditor);
                              
            visualizador.loadImage( desenhoTeste );

            this.deletarInstancia();
        }
    
    });

});

document.getElementById('botao-treinar-modelo').addEventListener('click', function(){
    treinarModelo();
});

document.getElementById('botao-continuar-treinamento-modelo').addEventListener('click', function(){
    extenderTreinamento();
});