class Editor{
    constructor( config={} ){
        this.titulo = config.titulo || '';
        this.backgroundColor = config.backgroundColor || 'rgb(0,0,0)';

        //Callbacks
        this.callbackEnviar = config.onEnviar || null;

        if( !config.resolucao ){ throw 'propriedade "resolucao" é obrigatória!' };

        if( config.cursor == undefined ){
            //Cursor com tudo padrão 
            config.cursor = {
                color: 'black',
                X: 0,
                Y: 0,
                width: 10,
                height: 10,
                insertionRate: 100, //100% do width e height do cursor
                opacity: 0.4,
                forcaBorracha: 0.5
            };

        }else{
            //Cursor com alguns valores padrão 
            if( !config.cursor.color ){ config.cursor.color = 'black' };
            if( !config.cursor.X ){ config.cursor.X = 0 };
            if( !config.cursor.Y ){ config.cursor.Y = 0 };
            if( !config.cursor.width ){ config.cursor.width = 10 };
            if( !config.cursor.height ){ config.cursor.height = 10 };
            if( !config.cursor.insertionRate ){ config.cursor.insertionRate = 100 };
            if( !config.cursor.opacity ){ config.cursor.opacity = 0.4 };
            if( !config.cursor.forcaBorracha ){ config.cursor.forcaBorracha = 0.5 };
        }

        if( config.limites == undefined ){
            config.limites = {
                crescimento: 1,
                decremento:  0
            }

        }else{
            //Cursor com alguns valores padrão 
            if( !config.limites.crescimento ){ config.limites.crescimento = 1 };
            if( !config.limites.decremento ){  config.limites.decremento  = 0 };
        }
        this.config = config;
        this.limites = config.limites;    
        this.valorFundo = config.valorFundo || 0;

        this.resolucao                   = config.resolucao;
        this.resolucaoInicial            = config.resolucao;
        this.top                         = config.top  || 0;
        this.left                        = config.left || 0;

        this.drawCanvas                  = document.createElement('canvas');
        this.drawCanvas.setAttribute('id', String(new Date().getTime()));
        this.drawCanvas.setAttribute('class', 'canvas-draw');
        this.drawCanvas.style.position = "absolute";
        this.drawCanvas.style.top = `${ this.top }px`;
        this.drawCanvas.style.left = `${ this.left }px`;
        this.drawCanvas.style.zIndex = 1;
        this.drawCanvas.style.border = "solid 4px black";
        this.drawCanvas.setAttribute("oncontextmenu", "return false");

        this.previewCanvas               = document.createElement('canvas');
        this.previewCanvas.setAttribute('id', String(new Date().getTime()));
        this.previewCanvas.setAttribute('class', 'canvas-preview');
        this.previewCanvas.style.position = "absolute";
        this.previewCanvas.style.top = `${ this.top }px`;
        this.previewCanvas.style.left = `${ this.left }px`;
        this.previewCanvas.style.zIndex = 22;
        this.previewCanvas.style.border = "solid 4px black";
        this.previewCanvas.style.backgroundColor = "rgba(0,0,0,0)";
        this.previewCanvas.setAttribute("oncontextmenu", "return false");

        document.body.prepend(this.drawCanvas);
        document.body.prepend(this.previewCanvas);

        //DIV para os titulos 
        this.divTitulo = document.createElement('div');
        this.divTitulo.style.position = 'absolute';
        document.body.prepend(this.divTitulo);
        this.divTitulo.style.width  = `${this.resolucao}px`;
        this.divTitulo.style.height = `100px`;

        let contexto = this;
        setTimeout(function(){
            contexto.divTitulo.style.top = `${ (contexto.top - 200) + parseInt(contexto.divTitulo.style.height) }px`;
        }, 200);

        this.divTitulo.style.left = `${ this.left }px`;
        this.divTitulo.style.backgroundColor = 'white'
        this.divTitulo.style.zIndex = 1;

        this.divTitulo.innerHTML = `
            <h1> ${ this.titulo || '' } </h1>    
        `;


        //DIV para os botões 
        this.divFerramentas = document.createElement('div');
        this.divFerramentas.style.position = 'absolute';
        document.body.prepend(this.divFerramentas);
        this.divFerramentas.style.width  = `${this.resolucao}px`;
        this.divFerramentas.style.height = `150px`;

        setTimeout(function(){
            contexto.divFerramentas.style.top = `${ contexto.top + 180 + parseInt(contexto.divFerramentas.style.height) }px`;
        }, 200);

        this.divFerramentas.style.left = `${ this.left }px`;
        this.divFerramentas.style.backgroundColor = 'white'
        this.divFerramentas.style.zIndex = 40;
        
        //Botoes
        this.botaoAumentarResolucao = document.createElement('button');
        this.botaoAumentarResolucao.setAttribute('class', 'botao');
        this.divFerramentas.appendChild(this.botaoAumentarResolucao);
        this.botaoAumentarResolucao.append('+')
        this.botaoAumentarResolucao.style.width = '90px';
        this.botaoAumentarResolucao.style.height = '80px';
        this.botaoAumentarResolucao.style.color = 'black';
        this.botaoAumentarResolucao.style.fontSize = '20pt';
        this.botaoAumentarResolucao.onclick = function(){
            contexto.resolucao += 100;
            contexto.drawCanvas.style.width = String(parseInt(contexto.drawCanvas.style.width) + 100) + 'px';
            contexto.drawCanvas.style.height = String(parseInt(contexto.drawCanvas.style.height) + 100) + 'px';
            contexto.previewCanvas.style.width = String(parseInt(contexto.previewCanvas.style.width) + 100) + 'px';
            contexto.previewCanvas.style.height = String(parseInt(contexto.previewCanvas.style.height) + 100) + 'px';
        }

        this.botaoDiminuirResolucao = document.createElement('button');
        this.botaoDiminuirResolucao.setAttribute('class', 'botao');
        this.divFerramentas.appendChild(this.botaoDiminuirResolucao);
        this.botaoDiminuirResolucao.append('-')
        this.botaoDiminuirResolucao.style.width = '90px';
        this.botaoDiminuirResolucao.style.height = '80px';
        this.botaoDiminuirResolucao.style.marginLeft = '10px';
        this.botaoDiminuirResolucao.style.color = 'black';
        this.botaoDiminuirResolucao.style.fontSize = '20pt';
        this.botaoDiminuirResolucao.onclick = function(){
            contexto.resolucao -= 100;
            contexto.drawCanvas.style.width = String(parseInt(contexto.drawCanvas.style.width) - 100) + 'px';
            contexto.drawCanvas.style.height = String(parseInt(contexto.drawCanvas.style.height) - 100) + 'px';
            contexto.previewCanvas.style.width = String(parseInt(contexto.previewCanvas.style.width) - 100) + 'px';
            contexto.previewCanvas.style.height = String(parseInt(contexto.previewCanvas.style.height) - 100) + 'px';
        }

        this.botaoExcluirImagem = document.createElement('button');
        this.botaoExcluirImagem.setAttribute('class', 'botao botao-excluir');
        this.divFerramentas.appendChild(this.botaoExcluirImagem);
        this.botaoExcluirImagem.append('X')
        this.botaoExcluirImagem.style.width = '90px';
        this.botaoExcluirImagem.style.height = '80px';
        this.botaoExcluirImagem.style.marginLeft = '10px';
        this.botaoExcluirImagem.style.backgroundColor = 'darkred';
        this.botaoExcluirImagem.style.color = 'white';
        this.botaoExcluirImagem.style.fontSize = '20pt';
        this.botaoExcluirImagem.onclick = function(){
            contexto.mudarResolucaoCanvas( contexto.resolucaoInicial );
            contexto.clearImage();
        }

        if( contexto.callbackEnviar )
        {
            this.botaoEnviarImagem = document.createElement('button');
            this.botaoEnviarImagem.setAttribute('class', 'botao');
            this.divFerramentas.appendChild(this.botaoEnviarImagem);
            this.botaoEnviarImagem.append('ENVIAR')
            this.botaoEnviarImagem.style.width = '180px';
            this.botaoEnviarImagem.style.height = '80px';
            this.botaoEnviarImagem.style.marginTop = '10px';
            this.botaoEnviarImagem.style.marginLeft = '0px';
            this.botaoEnviarImagem.style.backgroundColor = 'darkblue';
            this.botaoEnviarImagem.style.color = 'white';
            this.botaoEnviarImagem.style.fontSize = '20pt';
            this.botaoEnviarImagem.onclick = function(){
                contexto.callbackEnviar.bind(contexto)( contexto.getImage(), contexto );
                contexto.mudarResolucaoCanvas( contexto.resolucaoInicial );
                contexto.clearImage();
                if( contexto.config.deletarAposEnvio ){
                    contexto.deletarInstancia();
                }
            }
        }

        this.drawCanvas.style.width      = `${this.resolucao}px`;
        this.drawCanvas.style.height     = `${this.resolucao}px`;
        this.previewCanvas.style.width   = `${this.resolucao}px`;
        this.previewCanvas.style.height  = `${this.resolucao}px`;
        this.drawCanvas.style.backgroundColor = this.backgroundColor;

        this.matrix = [];
        this.previewCanvasRef = this.previewCanvas;
        this.drawCanvasRef    = this.drawCanvas;

        //Mouse
        this.cursor = {
            color: config.cursor.color || 'black',
            X: config.cursor.X || 0,
            Y: config.cursor.Y || 0,
            width: config.cursor.width || 10,
            height: config.cursor.height || 10,
            insertionRate: config.cursor.insertionRate || 100,
            opacity: config.cursor.opacity || 0.4,
            ativo: false,
            desenhando: false,
            apagando: false,
            forcaBorracha: config.cursor.forcaBorracha || 0.5
        };

        //Cria uma imagem base
        this.width = this.resolucao;
        this.height = this.resolucao;
        this.newImage( this.width, this.height );

        //Eventos
        const context = this;

        context.criarEventos();

        function isMobile() {
            return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
        }

        if( isMobile() ){
            context.criarEventosMobile();
        }

        this.onDesenhar.bind(this)();

    }

    mudarPosicao(top, left){
        this.drawCanvas.style.top = String(top) + 'px';
        this.drawCanvas.style.left = String(left) + 'px';
        this.previewCanvas.style.top = String(top) + 'px';
        this.previewCanvas.style.left = String(left) + 'px';
        this.divFerramentas.style.top = `${ top + 180 + parseInt(this.divFerramentas.style.height) }px`;
        this.divFerramentas.style.left = `${ left }px`;
    }

    mudarResolucaoCanvas( novaResolucao ){
        this.resolucao = novaResolucao;
        this.drawCanvas.style.width = String(novaResolucao) + 'px';
        this.drawCanvas.style.height = String(novaResolucao) + 'px';
        this.previewCanvas.style.width = String(novaResolucao) + 'px';
        this.previewCanvas.style.height = String(novaResolucao) + 'px';
    }

    deletarInstancia(){
        document.body.removeChild( this.drawCanvas );
        document.body.removeChild( this.previewCanvas );
        document.body.removeChild( this.divFerramentas );
    }

    criarEventos(){
        const context = this;

        this.previewCanvas.addEventListener('mouseenter', function(e){
            context.cursor.ativo = true;
        });
        this.previewCanvas.addEventListener('mouseleave', function(e){
            context.cursor.ativo = false;
        });
        //Quando prescionar botão do mouse
        this.previewCanvas.addEventListener('mousedown', function(evento){
            //Botao esquerdo
            if (evento.button === 0) {
                context.cursor.desenhando = true;

            //Botao do meio
            }else if (evento.button === 1) {
                
            //Botao direito
            } else if (evento.button === 2) {
                context.cursor.apagando = true;
            }

        });
        //Quando soltar botão do mouse
        this.previewCanvas.addEventListener('mouseup', function(evento){
            //Botao esquerdo
            if (evento.button === 0) {
                context.cursor.desenhando = false;

            //Botao do meio
            }else if (evento.button === 1) {
                
            //Botao direito
            } else if (evento.button === 2) {
                context.cursor.apagando = false;
            }
        });
        this.previewCanvas.addEventListener('mousemove', function(e){
            const rect = context.previewCanvas.getBoundingClientRect();

            // Calcula a posição correta, considerando a escala do canvas
            const scaleX = context.previewCanvas.width / rect.width;
            const scaleY = context.previewCanvas.height / rect.height;
        
            // Obtém a posição do mouse em relação ao canvas
            const X = (e.clientX - rect.left) * scaleX;
            const Y = (e.clientY - rect.top) * scaleY;
        
            // Atualiza a posição do cursor no contexto
            context.cursor.X = parseInt(X);
            context.cursor.Y = parseInt(Y);
        });
    }

    criarEventosMobile(){
        const context = this;

        this.previewCanvas.addEventListener('touchstart', function(e) {
            context.cursor.ativo = true;
            e.preventDefault();
        });
        this.previewCanvas.addEventListener('touchend', function(e) {
            context.cursor.ativo = false;
            e.preventDefault();
        });

        // Evento de pressionar o botão do mouse ou toque
        const iniciarDesenho = (evento, button = 0) => {
            if (button === 0 || evento.touches) {
                context.cursor.desenhando = true;
            } else if (button === 2) {
                context.cursor.apagando = true;
            }
        };

        this.previewCanvas.addEventListener('mousedown', function(evento) {
            iniciarDesenho(evento, evento.button);
        });
        this.previewCanvas.addEventListener('touchstart', function(evento) {
            iniciarDesenho(evento);
        });

        // Evento de soltar o botão do mouse ou término do toque
        const finalizarDesenho = (evento, button = 0) => {
            if (button === 0 || evento.changedTouches) {
                context.cursor.desenhando = false;
            } else if (button === 2) {
                context.cursor.apagando = false;
            }
        };

        this.previewCanvas.addEventListener('mouseup', function(evento) {
            finalizarDesenho(evento, evento.button);
        });
        this.previewCanvas.addEventListener('touchend', function(evento) {
            finalizarDesenho(evento);
        });

        // Movimento do mouse ou toque
        const atualizarPosicaoCursor = (e) => {
            const rect = context.previewCanvas.getBoundingClientRect();
            const scaleX = context.previewCanvas.width / rect.width;
            const scaleY = context.previewCanvas.height / rect.height;

            let X, Y;
            if (e.touches) {
                X = (e.touches[0].clientX - rect.left) * scaleX;
                Y = (e.touches[0].clientY - rect.top) * scaleY;
            } else {
                X = (e.clientX - rect.left) * scaleX;
                Y = (e.clientY - rect.top) * scaleY;
            }

            context.cursor.X = parseInt(X);
            context.cursor.Y = parseInt(Y);
        };

        this.previewCanvas.addEventListener('mousemove', atualizarPosicaoCursor);
        this.previewCanvas.addEventListener('touchmove', function(e) {
            atualizarPosicaoCursor(e);
            e.preventDefault();
        });
    }

    limitar( X, Y ){
        //Não permite que o valor do pixel seja maior do que o valor limite
        if( this.matrix[ X ][ Y ] >= this.limites.crescimento ){ this.matrix[ X ][ Y ] = this.limites.crescimento };

        //Não permite que o valor do pixel seja menor do que zero
        if( this.matrix[ X ][ Y ] < this.limites.decremento ){   this.matrix[ X ][ Y ] = this.limites.decremento };
    }

    // Função para verificar os limites da matriz
    estaDentroDosLimitesMatrix(X, Y) {
        return X >= 0 && X < this.matrix.length && Y >= 0 && Y < this.matrix[0].length;
    }

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
    resizeMatrix(matrix, oldSize, newSize) {
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

    /**
    * Um código que faz um corte em aréas que estão com valor zero no pixel, 
    * por exemplo, se eu tenho uma iamgem de resolução 1000x1000, ai eu faço um desenho no topo esquerdo dela, de tamanh 200x200,... 
    * vai ficar sobrando um montão de pixels zerados ao redor, .. 
    * Essa função iria cortar automaticamente esses pixels, mantendo apenas os pixels que estão a uns 5 de distancia dos pixels do desenho, e padronizando isso para uma matrix quadrada de NxN apenas com os pixels do desenho e mais 5 ao redor(de cada lado) que estiverem ao redor do desenho 
    * @param {Number[][]} matrix  - A matrix a ser cortada
    * @param {Number} margin      - Os pixels de distancia ao redor
    * @param {Number} targetSize  - A resolução NxN de saida
    * @returns 
    */
    cropAndPadMatrix(matrix, margin = 5, targetSize = 200) {
        const rows = matrix.length;
        const cols = matrix[0].length;
    
        // Encontra os limites do desenho
        let top = rows, bottom = 0, left = cols, right = 0;
    
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (matrix[i][j] !== 0) {
                    top = Math.min(top, i);
                    bottom = Math.max(bottom, i);
                    left = Math.min(left, j);
                    right = Math.max(right, j);
                }
            }
        }
    
        // Adiciona a margem
        top = Math.max(0, top - margin);
        bottom = Math.min(rows - 1, bottom + margin);
        left = Math.max(0, left - margin);
        right = Math.min(cols - 1, right + margin);
    
        // Extrai a região de interesse com margem
        const croppedMatrix = [];
        for (let i = top; i <= bottom; i++) {
            croppedMatrix.push(matrix[i].slice(left, right + 1));
        }
    
        // Redimensiona a matriz para targetSize x targetSize
        const scale = croppedMatrix.length / targetSize;
        const resizedMatrix = Array.from({ length: targetSize }, () => Array(targetSize).fill(0));
    
        for (let i = 0; i < targetSize; i++) {
            for (let j = 0; j < targetSize; j++) {
                const x = Math.floor(i * scale);
                const y = Math.floor(j * scale);
                resizedMatrix[i][j] = croppedMatrix[x][y];
            }
        }
    
        return resizedMatrix;
    }

    //Pode ser usado para deixar os pixels mais fortes, apenas reforçando o valor dos pixels
    reforcarPixels(p){ 
        return p.map( (h)=>{ return h.map( (j)=>{ return (j*j*1000) } ) } ) 
    }

    //Aplica rapidamente um reforço de pixels na propia imagem da instancia
    aplicarReforcoPixels(){
        this.loadImage( this.reforcarPixels( this.getImage() ) );
    }

    //Aplica rapidamente um redimensionamento na propia imagem da instancia
    aplicarResize( novaResolucao=100 ){
        this.aplicarReforcoPixels();
        editor.loadImage( editor.resizeMatrix( editor.getImage(), this.resolucao, novaResolucao ) );
    }

    //Define um ponto na matrix resultante
    setMatrix( X, Y, valor, preencherWidth, preencherHeight ){
        if( this.matrix[X] == undefined ){return}; //Evita erros 

        // Insere o valor inicial na posição (X, Y)
        this.matrix[X][Y] = valor;

        const porcentagem = this.cursor.insertionRate/100;

        // Preenche a área especificada a partir do ponto de origem
        for (let i = 0; i < (porcentagem * preencherWidth); i++) {
            for (let j = 0; j < (porcentagem * preencherHeight); j++) {
                let novoX = X + i;
                let novoY = Y + j;

                // Verifica se estamos dentro dos limites da matriz
                if (this.estaDentroDosLimitesMatrix(novoX, novoY)) {
                    this.matrix[novoX][novoY] = valor;
                }
            }
        }
        
        // Limita valores, caso precise realizar outra operação após o preenchimento
        this.limitar(X, Y);
    }

    somarMatrix( X, Y, valor, preencherWidth, preencherHeight ){
        if( this.matrix[X] == undefined ){return}; //Evita erros 

        //Insere na matrix
        this.setMatrix( X, Y, (this.matrix[ X ][ Y ] + valor), preencherWidth, preencherHeight );
    }

    subtrairMatrix( X, Y, valor, preencherWidth, preencherHeight ){
        if( this.matrix[X] == undefined ){return}; //Evita erros 

        //Insere na matrix
        this.setMatrix( X, Y, (this.matrix[ X ][ Y ] - valor), preencherWidth, preencherHeight );
    }

    onDesenhar(){
        
        const rgbString       = ( this.cursor.color || 'rgb(0,0,0)').split('rgb(')[1].replace(')', '');
        const cursor          = this.getCursor();
        const drawContext     = this.drawCanvasRef.getContext('2d');
        const previewContext  = this.previewCanvasRef.getContext('2d');
        const cursorOpacity   = cursor.opacity <= this.limites.crescimento ? cursor.opacity : this.limites.crescimento;
        const clearRate       = (50/100*parseInt(this.previewCanvasRef.style.width)) * (-0.5 * -this.resolucao);

        previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width) + clearRate, parseInt(this.previewCanvasRef.style.height) );
        previewContext.fillStyle = `rgba(${rgbString}, ${ cursorOpacity } )`;
        previewContext.fillRect(cursor.X, cursor.Y, cursor.width, cursor.height);

        //Ao desenhar
        if( cursor.ativo == true && cursor.desenhando == true ){
            previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );

            //Desenha na tela
            drawContext.fillStyle = `rgba(${rgbString}, ${ cursorOpacity })`;
            drawContext.fillRect(cursor.X, cursor.Y, cursor.width, cursor.height);

            //Insere na matrix
            this.somarMatrix( cursor.X, 
                              cursor.Y, 
                              cursor.opacity, 
                              cursor.width, 
                              cursor.height );
            
        }

        //Ao apagar
        if( cursor.ativo == true && cursor.apagando == true ){
            previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );

            //Desenha na tela
            const potenciaDeletar = cursor.forcaBorracha * (cursor.opacity + cursor.forcaBorracha);

            drawContext.fillStyle = `rgba(255,255,255, ${ potenciaDeletar })`;
            drawContext.fillRect(cursor.X, cursor.Y, cursor.width, cursor.height);

            //Insere na matrix
            this.subtrairMatrix( cursor.X, 
                                 cursor.Y, 
                                 cursor.opacity, 
                                 cursor.width, 
                                 cursor.height );
        }

        //Cria um loop infinito
        requestAnimationFrame(this.onDesenhar.bind(this));
    }

    clearImage(){
        const drawContext     = this.drawCanvasRef.getContext('2d');
        const previewContext  = this.previewCanvasRef.getContext('2d');
        const clearRate       = (50/100*parseInt(this.previewCanvasRef.style.width)) * (-0.5 * -this.resolucao); //Quando menor a resolução maior vai precisar ser a area de limpeza
    
        //Limpa tudo
        previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width) + clearRate, parseInt(this.previewCanvasRef.style.height) );
        drawContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width) + clearRate, parseInt(this.previewCanvasRef.style.height) );
        this.matrix = [];
        this.newImage( this.resolucao, this.resolucao );
    }

    newImage( width, height ){
        this.matrix = [];

        for( let linha = 0 ; linha < width ; linha++ ){
            this.matrix[linha] = [];
            for( let coluna = 0 ; coluna < height ; coluna++ ){
                this.matrix[linha][coluna] = this.valorFundo;
            }
        }
    }

    /**
    * Carrega uma imagem
    * @param {*} imageMatrix 
    */
    loadImage( imageMatrix ){
        const cursor          = this.getCursor();
        const rgbString       = ( this.cursor.color || 'rgb(0,0,0)').split('rgb(')[1].replace(')', '');
        const imageWidth      = this.matrix.length;
        const imageHeight     = this.matrix[0].length;
        const drawContext     = this.drawCanvasRef.getContext('2d');
        const previewContext  = this.previewCanvasRef.getContext('2d');
        const clearRate       = (50/100*parseInt(this.previewCanvasRef.style.width)) * (-0.5 * -this.resolucao); //Quando menor a resolução maior vai precisar ser a area de limpeza
        
        previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width) + clearRate, parseInt(this.previewCanvasRef.style.height) );
        drawContext.clearRect(0,0, parseInt(this.drawCanvasRef.style.width) + clearRate, parseInt(this.drawCanvasRef.style.height) );

        for( let linha = 0 ; linha < imageWidth ; linha++ ){
            for( let coluna = 0 ; coluna < imageHeight ; coluna++ ){

                const valorPixel = imageMatrix[linha][coluna];

                //Se tem pixels
                if( imageMatrix[linha][coluna] > this.valorFundo ){
                    //Desenha na tela
                    drawContext.fillStyle = `rgba(${rgbString}, ${ 

                        valorPixel >= 0 ? (valorPixel > this.limites.crescimento ? this.limites.crescimento : valorPixel) //Se for positivo
                                        : (valorPixel < this.limites.decremento  ? this.limites.decremento  : valorPixel) //Se for negativo

                    })`;
                    drawContext.fillRect(linha, coluna, cursor.width, cursor.height);
                }

                //Insere na matrix
                this.setMatrix( linha, coluna, valorPixel );
            }
        }
    }

    //Obtem a imagem original
    getImage(){
        return this.matrix;
    }

    //Obtem a imagem redimensionada para uma resolução especifica
    getResizedImage( novaResolucao = 100 ){
        return this.resizeMatrix(this.getImage(), this.resolucao, novaResolucao);
    }

    getCursor(){
        return this.cursor;
    }
}

/*
const editor = new Editor({
    resolucao: 300,
    top: 100,
    left: 100,
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
        console.log(desenho);
    }

});*/

