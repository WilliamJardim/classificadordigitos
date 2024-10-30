class Dataset{
    constructor( dados=[] ){
        this.dados = dados;
    }

    insert( desenho ){
        this.dados.push( desenho );
    }

    getDados(){
        return this.dados;
    }

    setDados( dados ){
        this.dados = dados;
    }
}