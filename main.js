const dataset        = new Dataset();

function isDatasetCarregado()
{
    return dataset.getDados().length > 0 ?  true : false;
}

//Libera alguns botões se o dataset estiver carregado
function liberarTreinamento()
{
    const isCarregado = dataset.getDados().length > 0 ?  true : false;

    document.getElementById('botao-treinar-modelo').disabled = !isCarregado;
    document.getElementById('botao-continuar-treinamento-modelo').disabled = !isCarregado;
    document.getElementById('botao-testar-modelo').disabled = !isCarregado;
    document.getElementById('campo-epocas').disabled = !isCarregado;
    document.getElementById('campo-epocas-mostrar').disabled = !isCarregado;
    document.getElementById('campo-taxa-aprendizado').disabled = !isCarregado;
}

liberarTreinamento();

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

const posicaoEditor = {
    top:  window.innerWidth >= 1676 ? 290 : 650,
    left: window.innerWidth >= 1676 ? 500 : 500
}

const editorCaracter = null;

function escreverConsole(texto)
{
    const agora = new Date();
    const horas = agora.getHours();      // Hora (0-23)
    const minutos = agora.getMinutes();  // Minuto (0-59)
    const segundos = agora.getSeconds(); // Segundo (0-59)

    const consoleElement = document.getElementsByClassName('corpo-console')[0];
    consoleElement.innerHTML += `
        <p class='linha-console'>${horas}:${minutos}:${segundos} - ${texto}</p>
    `;
    
    // Define a rolagem para o final do elemento
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

function limparConsole()
{
    document.getElementsByClassName('corpo-console')[0].innerHTML = '';
}

function exibirCustosConsole(instanciaModelo, aCada=1)
{   
    //Exibe um resumo do treinamento, apenas a primeira epoca, algumas intermediarias e ultima
    const historicoTreino = instanciaModelo.geralMonitor.history;
    if( historicoTreino[0] != undefined ){ escreverConsole( historicoTreino[0]['message'] ) };
    
    for( let iHistorico = 1 ; iHistorico < historicoTreino.length-1 ; iHistorico = iHistorico + (25/100 * historicoTreino.length-1) )
    {
        if( historicoTreino[iHistorico] != undefined ){ escreverConsole( historicoTreino[iHistorico]['message'] ) };
    }   

    if( historicoTreino[historicoTreino.length-1] != undefined ){ escreverConsole( historicoTreino[historicoTreino.length-1]['message'] ) };
}

function adicionarImagemNaLista( desenho, cursor )
{
   const visualizador = new Viewer( 'lista-dataset',
                                    '',
                                    [],
                                    cursor, 
                                    configEditor ); 
                                    
   visualizador.loadImage( desenho );
   liberarTreinamento();
}

//Carrega um dataset
function carregarDataset( datasetArray = [], cursor ){
    dataset.setDados(datasetArray);
    dataset.getDados().forEach(function( desenho ){
        adicionarImagemNaLista(desenho, cursor);
    })
    escreverConsole('Dataset carregado!');
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


var camadasCriadas = [];
var USAR_CAMADAS_FORM = true; //Se for false, vai esconder o formulario de cadastrar camadas

function liberarBotoesEditorCamada()
{
    document.getElementById('botao-apagar-todas-camadas').disabled = camadasCriadas.length == 0;
}

function espelharCampos( campo1, campo2 )
{
    document.getElementById(campo2).value = document.getElementById(campo1).value;
}

liberarBotoesEditorCamada();

function removerCamadaLista( idCamada ){
    document.getElementById(`camada-${idCamada}`).parentNode
                                                 .removeChild( document.getElementById(`camada-${idCamada}`) );

    let tipoCamadaApagando = null;

    camadasCriadas = camadasCriadas.filter( ( camadaAtual ) => {
        if(camadaAtual.id != idCamada){
            return camadaAtual

        }else{
            tipoCamadaApagando = camadaAtual.tipo;
        }
    });

    if( tipoCamadaApagando == LayerType.Final )
    {
        //Reativa o botão de criar nova camada
        document.getElementById('botao-nova-camada').disabled = false;
    }

    liberarBotoesEditorCamada();
}

function adicionarCamadaNaLista( dadosCamada ){

    const idNovaLinha = String( new Date().getTime() ) + String(camadasCriadas.length);

    //Faz uma normalização de atributos
    dadosCamada['id']     = idNovaLinha;
    dadosCamada['type']   = dadosCamada['tipo'];
    dadosCamada['inputs'] = dadosCamada['entradas'];
    dadosCamada['units']  = dadosCamada['unidades'];
    camadasCriadas.push(dadosCamada);

    window.onAlterarValorEntradas = function(e, idNovaLinha){
        const campo = e.target;
        const valor = campo.value;
        camadasCriadas = camadasCriadas.map(function(camadaAtual){
            if( camadaAtual.id == idNovaLinha )
            {
                camadaAtual['entradas'] = Number(valor);
                camadaAtual['inputs'] = camadaAtual['entradas'];
            }

            return camadaAtual;
        });
    }

    window.onAlterarValorUnidades = function(e, idNovaLinha){
        const campo = e.target;
        const valor = campo.value;
        camadasCriadas = camadasCriadas.map(function(camadaAtual){
            if( camadaAtual.id == idNovaLinha )
            {
                camadaAtual['unidades'] = Number(valor);
                camadaAtual['units'] = camadaAtual['unidades'];
            }

            return camadaAtual;
        });
    }

    document.getElementById('table-lista-camadas').innerHTML += `
        <tr id='camada-${idNovaLinha}'>
            <td> <input type="text"   
                       value='${ dadosCamada.tipoPT }' 
                       readonly 
                       ${ dadosCamada.tipo == LayerType.Input && isDatasetCarregado() ? 'readonly disabled' : '' } >
                 </input> 
            </td>
            
            <td> <input type="number" 
                        value='${ dadosCamada.entradas }' 
                        onchange='onAlterarValorEntradas(event, ${idNovaLinha})'
                        ${ dadosCamada.tipo == LayerType.Input && isDatasetCarregado() ? 'readonly disabled' : '' } >
                 </input> 
            </td>
            
            <td> <input type="number" 
                        value='${ dadosCamada.unidades }' 
                        onchange='onAlterarValorUnidades(event, ${idNovaLinha})'
                        ${ dadosCamada.tipo == LayerType.Input && isDatasetCarregado() ? 'readonly disabled' : '' } >
                 </input> 
            </td>
            
            <td> 
              <button ${ dadosCamada.tipo == LayerType.Input ? 'disabled' : '' } class='botao-vermelho botao-remover-camada' onclick='window.removerCamadaLista(${idNovaLinha})'> X </button> 
            </td>
        </tr>
    `    
}

var pesosInicias   = null;
var pesosFinais    = null;
var vaiInterromper = false;

// Estrutura da rede: 65536 unidades na entrada, 2 unidades na camada oculta, e 1 na saída
var mlpConfig = {
    layers: [
        { type: LayerType.Input,  inputs: 4096,   units: 4096 }, //Aqui são apenas 65536 entradas, preciso melhorar esse método
        { type: LayerType.Hidden, inputs: 4096,   units: 4, functions: Array(4).fill('Sigmoid')  }, 
        { type: LayerType.Final,  inputs: 4,      units: 3, functions: [ 'Sigmoid', 'Sigmoid', 'Sigmoid' ]  }
    ],
    initialization: Initialization.Random
};

if( USAR_CAMADAS_FORM == true )
{
    document.getElementById('dev-config-estrutura').style.visibility = 'visible';
    document.getElementById('dev-config-estrutura').style.display = 'block';

    //Adiciona os valores padrão na lista para manter o padrão que estava antes da atualização
    adicionarCamadaNaLista({ 
        tipo: LayerType.Input, tipoPT: 'Entrada', entradas: 4096, unidades: 4096 
    });
    adicionarCamadaNaLista({ 
        tipo: LayerType.Hidden, tipoPT: 'Oculta', entradas: 4096, unidades: 4 
    });
    adicionarCamadaNaLista({ 
        tipo: LayerType.Final, tipoPT: 'Final',  entradas: 4, unidades: 3 
    });
    document.getElementById('table-lista-camadas').style.visibility = 'visible';
    document.getElementById('table-lista-camadas').style.display = 'block';

    //Bloquear para não permitir o usuario continuar cadastrando até que ele limpe tudo ou apague a camada final
    document.getElementById('botao-nova-camada').disabled = true;
    document.getElementById('botao-apagar-todas-camadas').disabled = false;

}else{
    //SE NÂO ESTIVERMOS USANDO CAMADAS CONFIGURAVEIS, VAMOS ESCONDER O FORMULARIO
    document.getElementById('dev-config-estrutura').style.visibility = 'hidden';
    document.getElementById('dev-config-estrutura').style.display = 'none';
}

function treinarModelo(){
    const valorEpocas         = document.getElementById('campo-epocas').value;
    const valorEpocasMostrar  = document.getElementById('campo-epocas-mostrar').value;
    const valorAprendizado    = Number( document.getElementById('campo-taxa-aprendizado').value.replace(',','.') );
    vaiInterromper = false;

    if( window.confirm('Deseja iniciar o treinamento( SIM/NAO ) ??? Isso pode demorar um pouco!') == false ){
        console.log('cancelado');
        escreverConsole('Treinameto cancelado!');
        return;
    }

    escreverConsole('Modelo criado!');

    if( USAR_CAMADAS_FORM == true )
    {
        //Pega as configurações de camadas do formulario e joga aqui no mlpConfig.layers
        mlpConfig.layers = [...camadasCriadas];
        
    }else{
        console.warn('USANDO CONFIGURAÇÔES DE INTERNAS DE DESENVOLVIMENTOS definidas em mlpConfig');
    }

    //Cria a rede
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

    escreverConsole('Treinamento iniciado!');
    
    // Treinando a rede
    mlp.train(inputs, targets, valorAprendizado, valorEpocas, valorEpocasMostrar, function(){
        return vaiInterromper ? true : false; //Sinaliza se queremos interromper o fluxo de treinamento SIM/NAO
    });

    window.pesosFinais = mlp.exportParameters();

    exibirCustosConsole( mlp, valorEpocasMostrar );
    escreverConsole('Treinamento concluido!');

    return mlp;
}

function extenderTreinamento(){
    const valorEpocas         = document.getElementById('campo-epocas').value;
    const valorEpocasMostrar  = document.getElementById('campo-epocas-mostrar').value;
    const valorAprendizado    = Number( document.getElementById('campo-taxa-aprendizado').value.replace(',','.') );
    vaiInterromper = false;

    if(!window.mlp){
        escreverConsole('MODELO NÂO FOI INICIADO!');
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

    escreverConsole('Continuando treinamento ....!');

    // Treinando a rede (USANDO A MESMA INSTANCIA DO MODELO)
    mlp.train(inputs, targets, valorAprendizado, valorEpocas, valorEpocasMostrar, function(){
        return vaiInterromper ? true : false; //Sinaliza se queremos interromper o fluxo de treinamento SIM/NAO
    });

    window.pesosFinais = mlp.exportParameters();

    exibirCustosConsole( mlp, valorEpocasMostrar );
    escreverConsole('Treinamento concluido!');
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
        top: posicaoEditor.top,
        left: posicaoEditor.left,
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
        escreverConsole('MODELO NÂO FOI TREINADO!');
        return;
    }

    //document.getElementById('resultados-testes').innerHTML = '';

    const editorTeste = new Editor({
        resolucao: 256,
        top: posicaoEditor.top,
        left: posicaoEditor.left,
        titulo: 'Desenhe',
        backgroundColor: 'rgb(0,0,0)',
    
        //Configurações iniciais do cursor
        cursor: {...dadosCursor},
    
        //Limita quais serão a faixa de valores dos pixels a serem desenhados
        limites: configEditor.limites,
        
        onEnviar: function( desenhoTeste ){
            const estimativa = window.mlp.forward( planificarDesenho( desenhoTeste ) );

            console.log('RESULTADO ESTIMADO', estimativa);
            escreverConsole('RESULTADO ESTIMADO: ' + String(estimativa) );

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

document.getElementById('botao-treinar-modelo').addEventListener('click', function(e){
    e.preventDefault();

    setTimeout(()=>{
        treinarModelo();
    }, 1);
});

document.getElementById('botao-continuar-treinamento-modelo').addEventListener('click', function(e){
    e.preventDefault();
    
    setTimeout(()=>{
        extenderTreinamento();
    }, 1);
});

document.getElementById('botao-nova-camada').onclick = function(e){
    e.preventDefault();
    
    let tipoCamada = LayerType.Input;

    if( camadasCriadas.length == 0 )
    {
        document.getElementById('tipoEntrada').checked = true;

        //Se tem um dataset carregado
        if( dataset.getDados()    != undefined &&
            dataset.getDados()[0] != undefined
        ){
            const imagemBase       = dataset.getDados()[0];
            const heightDesenho    = imagemBase.length;
            const widthDesenho     = imagemBase[0].length;
            const resolucaoImagem  = (widthDesenho * heightDesenho);

            //Define a resolução nos campos
            document.getElementById('campo-entradas').value = String(resolucaoImagem);
            document.getElementById('campo-unidades').value = String(resolucaoImagem);
            document.getElementById('campo-entradas').disabled = true;
        }
    }

    document.getElementById('botao-apagar-todas-camadas').style.visibility = 'hidden';
    document.getElementById('botao-apagar-todas-camadas').style.display = 'none';
    document.getElementById('botao-nova-camada').style.visibility = 'hidden';
    document.getElementById('botao-nova-camada').style.display = 'none';
    document.getElementById('table-lista-camadas').style.visibility = 'hidden';
    document.getElementById('table-lista-camadas').style.display = 'none';

    document.getElementById('error-lista-camadas').innerHTML = '';
    document.getElementById('tipoEntrada').disabled = false;
    document.getElementById('tipoOculta').disabled = true;
    document.getElementById('tipoFinal') .disabled = true;
    document.getElementById('campo-unidades').disabled = true;

    //Se for a primeira camada a ser criada
    if(camadasCriadas.length > 0)
    {
        tipoCamada = LayerType.Hidden;

        //Valores padrão
        document.getElementById('campo-entradas').value = camadasCriadas[camadasCriadas.length-1].unidades;
        document.getElementById('campo-entradas').disabled = true;
        
        document.getElementById('campo-unidades').value = '4';

        document.getElementById('tipoOculta').checked = true;

        document.getElementById('tipoEntrada').disabled = true;
        document.getElementById('tipoOculta').disabled = false;
        document.getElementById('campo-unidades').disabled = false;
        document.getElementById('tipoFinal') .disabled = true;

        //Se tiver pelo menos uma camada oculta, permite criar a camada final
        if( camadasCriadas.length >= 2 ){
            document.getElementById('tipoFinal') .disabled = false;
        }

        //Se ja tem a camada final, ele não permite adicionar mais nenhuma final e nem oculta
        if( camadasCriadas[camadasCriadas.length-1].tipo == 'final' ){
            document.getElementById('tipoOculta') .disabled = true;
            document.getElementById('tipoFinal') .disabled = true;
        }
    }

    window.escolheuTipoCamada = function( nomeTipoCamada ){
        tipoCamada =   nomeTipoCamada == 'entrada' ? LayerType.Input 
                     : nomeTipoCamada == 'oculta'  ? LayerType.Hidden 
                     : nomeTipoCamada == 'final'   ? LayerType.Final 
                     : null;

        if( tipoCamada == LayerType.Input ){
            document.getElementById('campo-unidades').disabled = true;
        }else{
            document.getElementById('campo-unidades').disabled = false;
        }
    }

    const controlarEspelhamentosEditorCamadas = function(){
        if( camadasCriadas.length == 0 && tipoCamada == 'entrada' ){
            espelharCampos( 'campo-entradas', 'campo-unidades' );
        }
    }

    //Adiona eventos aos campos do formulario de cadastro da camada
    document.getElementById('campo-entradas').oninput = function(){
        controlarEspelhamentosEditorCamadas();
    }

    const onCriarCamada = function(){

        const qtdeEntradas        = Number(document.getElementById('campo-entradas').value);
        const qtdeUnidades        = Number(document.getElementById('campo-unidades').value);
        const dadosCamadaAnterior = camadasCriadas[ camadasCriadas.length-1 ] || {};

        //Validações
        if( tipoCamada != LayerType.Input && 
            dadosCamadaAnterior.unidades != qtdeEntradas 
        ){
            document.getElementById('error-lista-camadas').innerHTML = `ERRO: A quantidade de entradas precisa ser igual a quantidade de unidades da camada anterior!`;
            return;
        }

        if( qtdeEntradas <= 0 ){
            document.getElementById('error-lista-camadas').innerHTML = `ERRO: A quantidade de entradas precisa ser maior que zero!`;
            return;
        }

        if( qtdeUnidades <= 0 ){
            document.getElementById('error-lista-camadas').innerHTML = `ERRO: A quantidade de unidades precisa ser maior que zero!`;
            return;
        }

        document.getElementById('error-lista-camadas').innerHTML = '';

        adicionarCamadaNaLista({
            tipo     : tipoCamada,
            tipoPT   : tipoCamada == LayerType.Input ? 'Entrada' : tipoCamada == LayerType.Hidden ? 'Oculta' : tipoCamada == LayerType.Final ? 'Final' : '', //Em portugues
            entradas : qtdeEntradas,
            unidades : (tipoCamada == LayerType.Input ? qtdeEntradas : qtdeUnidades)
        });

        if( document.getElementById('div-form-add-camada').isCriando == true ){
            document.getElementById('div-form-add-camada').isCriando = false;
            document.getElementById('div-form-add-camada').style.visibility = 'hidden';
            document.getElementById('div-form-add-camada').style.display = 'none';
        }

        document.getElementById('botao-apagar-todas-camadas').style.visibility = 'visible';
        document.getElementById('botao-apagar-todas-camadas').style.display = 'inline';
        document.getElementById('botao-nova-camada').style.visibility = 'visible';
        document.getElementById('botao-nova-camada').style.display = 'inline';

        if( camadasCriadas.length > 0 )
        {
            document.getElementById('table-lista-camadas').style.visibility = 'visible';
            document.getElementById('table-lista-camadas').style.display = 'inline';
        }

        if( tipoCamada == LayerType.Final ){
            //Bloquear para não permitir o usuario continuar cadastrando até que ele limpe tudo ou apague a camada final
            document.getElementById('botao-nova-camada').disabled = true;
        }

        liberarBotoesEditorCamada();

    }

    const onCancelarCamada = function(){
        if( document.getElementById('div-form-add-camada').isCriando == true ){
            document.getElementById('div-form-add-camada').isCriando = false;
            document.getElementById('div-form-add-camada').style.visibility = 'hidden';
            document.getElementById('div-form-add-camada').style.display = 'none';
        }

        document.getElementById('botao-apagar-todas-camadas').style.visibility = 'visible';
        document.getElementById('botao-apagar-todas-camadas').style.display = 'inline';
        document.getElementById('botao-nova-camada').style.visibility = 'visible';
        document.getElementById('botao-nova-camada').style.display = 'inline';
        
        if( camadasCriadas.length > 0 )
        {
            document.getElementById('table-lista-camadas').style.visibility = 'visible';
            document.getElementById('table-lista-camadas').style.display = 'inline';
        }
    }

    if( !document.getElementById('div-form-add-camada').isCriando ){
        document.getElementById('div-form-add-camada').isCriando = true;
        document.getElementById('div-form-add-camada').style.visibility = 'visible';
        document.getElementById('div-form-add-camada').style.display = 'block';

        //Ao criar uma nova camada
        document.getElementById('botao-criar-camada').onclick = function(e){
            e.preventDefault();
            onCriarCamada();
        };

        //Ao cancelar
        document.getElementById('botao-cancelar-camada').onclick = function(e){
            e.preventDefault();
            onCancelarCamada();
        };
    }
};

document.getElementById('botao-apagar-todas-camadas').onclick = function(){
    camadasCriadas = [];
    document.getElementById('table-lista-camadas').innerHTML = `
        <tr class='cabecalho-lista-camadas'>
            <td> Tipo </td>
            <td> Entradas </td>
            <td> Unidades </td>
            <td> <button class="hidden-button"></button> </td>
        </tr>
    `;

    //Reativa o botão de criar nova camada
    document.getElementById('botao-nova-camada').disabled = false;
    document.getElementById('table-lista-camadas').style.visibility = 'hidden';
    document.getElementById('table-lista-camadas').style.display = 'none';

    if( camadasCriadas.length > 0 )
    {
        document.getElementById('table-lista-camadas').style.visibility = 'visible';
        document.getElementById('table-lista-camadas').style.display = 'inline';
    }

    liberarBotoesEditorCamada();
}