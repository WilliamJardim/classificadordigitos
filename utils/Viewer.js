class Viewer{
    constructor( colocarEm, titulo, estimativasProntas, cursor, config ){
        this.cursor = cursor;
        this.config = config;
        this.titulo = titulo;

        this.criarTabela = function(){
            return estimativasProntas.length > 0 ? `
                <table>
                    <tr class='tr-cabecalho'>
                        ${
                            estimativasProntas.map(( valor, numero )=>{
                                return `
                                    <td>
                                        Classe ${numero + 1}
                                    </td>
                                `
                            })
                        }
                    </tr>
                    <tr>
                        ${
                            estimativasProntas.map(( valor, numero )=>{
                                return `
                                    <td>
                                        ${valor}
                                    </td>
                                `
                            })
                        }
                    </tr>
                </table>` : '';
        }

        this.divConteudo = `
            <div class="box-shadow-none cabecalho">
                <h2> ${ this.titulo } </h2>
                ${
                    this.criarTabela()
                }
            </div>

            <div class="box-shadow-none corpo">

            </div>
        `;

        this.div = document.createElement('div');
        this.div.setAttribute('class', 'box-shadow-none visualizador-imagem');
        this.div.innerHTML = this.divConteudo;
        document.getElementById(colocarEm).appendChild( this.div );

        this.canvas = document.createElement('canvas');
        this.div.querySelector('.corpo').appendChild(this.canvas);
    }

    /**
    * Carrega uma imagem
    * @param {*} imageMatrix 
    */
    loadImage( imageMatrix ){
        const cursor          = this.cursor;
        const rgbString       = ( this.cursor.color || 'rgb(0,0,0)').split('rgb(')[1].replace(')', '');
        const imageWidth      = imageMatrix.length;
        const imageHeight     = imageMatrix[0].length;
        const canvasContext   = this.canvas.getContext('2d');
        const clearRate       = (50/100*parseInt(this.canvas.style.width)) * (-0.5 * -this.resolucao); //Quando menor a resolução maior vai precisar ser a area de limpeza
        
        this.canvas.style.width  = `${imageMatrix[0].length}px`;
        this.canvas.style.height = `${imageMatrix.length}px`;
        canvasContext.clearRect(0,0, parseInt(this.canvas.style.width) + clearRate, parseInt(this.canvas.style.height) );

        for( let linha = 0 ; linha < imageWidth ; linha++ ){
            for( let coluna = 0 ; coluna < imageHeight ; coluna++ ){

                const valorPixel = imageMatrix[linha][coluna];

                //Desenha na tela
                canvasContext.fillStyle = `rgba(${rgbString}, ${ 

                    valorPixel >= 0 ? (valorPixel > this.config.limites.crescimento ? this.config.limites.crescimento : valorPixel) //Se for positivo
                                    : (valorPixel < this.config.limites.decremento  ? this.config.limites.decremento  : valorPixel) //Se for negativo

                })`;
                canvasContext.fillRect(linha, coluna, cursor.width, cursor.height);
            }
        }
    }
}