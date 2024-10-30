const dataset = new Dataset();

const editorCaracter = new Editor({
    resolucao: 300,
    top: 100,
    left: 800,
    titulo: 'Desenhe a letra W',
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
}