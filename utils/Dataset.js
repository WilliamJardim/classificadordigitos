class Dataset{
    constructor( dados=[] ){
        this.dados = dados;
    }

    insert( desenho ){
        this.dados.push( desenho );
    }
}