class Viewer{
    constructor( colocarEm, cursor, config ){
        this.cursor = cursor;
        this.config = config;
        this.canvas = document.createElement('canvas');
        document.getElementById(colocarEm).appendChild(this.canvas);
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