export class NTDictionary<T>{
    dictionary : { [id: string] : T; } = {};

    constructor(){
        this.dictionary = {}
    }

    Keys(){
        return Object.keys(this.dictionary);
    }

    Get(key : string){
        return this.dictionary[key];
    }

    Add(key : string, value : T){
        this.dictionary[key] = value;
    }

    Remove(key : string){
        delete this.dictionary[key]
    }

    Clear(){
        this.dictionary = {}
    }

    Count(){
        return Object.keys(this.dictionary).length
    }
}