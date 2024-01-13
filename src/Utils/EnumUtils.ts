class EnumUtils{
    ToString(kind:any ,value: any){
        return kind[value];
    }
    ToNumber(value: any){
        return value;
    }

    IsExist(kind: any, value: any){
        if (value in kind) {
            return true;
        }else{
            return false;
        }
    }
}

export const enumUtils = new EnumUtils();