export class ObjectData{
    Key : any;
    Value : any;
    constructor(key : any, value : any){
        this.Key = key;
        this.Value = value;
    }
}

export class DataModel {
    static Parse<T>(data): T {
        try {
            data = JSON.parse(data);
            try {
                if (typeof data == "string") {
                    data = JSON.parse(data);
                }
            } catch (error) { }
        } catch (err) { }
        return data;
    }

    static ParseObjectToList(obj) {
        var listObj : ObjectData[] = [];
        (Object.keys(obj) as (keyof typeof obj)[]).forEach((key, index) => {
            // 👇️ name Bobby Hadz 0, country Chile 1
            listObj.push(new ObjectData(key, obj[key]))
        });
        return listObj;
    }
}