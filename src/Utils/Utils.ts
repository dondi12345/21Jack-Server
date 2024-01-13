
class Utils {

    yyyymmdd(date:Date) {
        //let date = new Date();
        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();
      
        return Number([
            date.getFullYear(),
          (mm > 9 ? '' : '0') + mm,
          (dd > 9 ? '' : '0') + dd,
        ].join(''));
      };

      
      /**
       * random >= min & <= max
       * @param _min 
       * @param _max 
       * @returns number
       */
      getRandomInt(_min:number, _max:number) {
        _min = Math.ceil(_min);
        _max = Math.floor(_max);
        return Math.floor(Math.random() * (_max - _min + 1)) + _min;
    }

    strToNumber(str){
        var numb : number =+ str;
        return numb;
    }

    //1702529984
    timeStampSec(){
        return Math.floor(new Date().getTime() / 1000)
    }

    //19723
    getTotalDay(){
        return Math.floor(new Date().getTime() / 86400000)
    }

    //
    isMonday(){
        if(new Date().getDay() == 1) return true;
        else return false;
    }

    shuffle(array: any[]){ 
      for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
      } 
      return array; 
    };

    //Enum to string
    ToString(kind:any ,value: any){
        return kind[value];
    }

    structuredClone(data:any)
    {
      return JSON.parse(JSON.stringify(data))
    }

    //Array
    arrayRemoveByIndex(arr :any[], index : number){
        if(index >= arr.length) return;
        if(index < 0) return;
        if(arr.length == 0) return;
        arr.splice(index,1);
    }

}

function FormatString(str: string , arr: string[]){
  var a = str;
  for(let i = 0; i < arr.length; i++){
      a = a.replace(`{${i}}`, arr[i])
  }
  return a;
}


export const Util = new Utils();