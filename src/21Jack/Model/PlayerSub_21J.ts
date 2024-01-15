import { Util } from "../../Utils/Utils";

export class PlayerInfo_21J {
    ID: string;
    SessionId: string;
    Name: string;
    Avata: string;
}

export class PlayerData_21J{
    SessionId: string;
    Cards : number[] = [];
    HoldCard : number = -1;
    WhiteCard : number[] = [];
    Slot : CardSlot[] = [];

    ResetData(){
        var cards : number[] = [];
        for (let index = 0; index < 52; index++) {
            cards.push(index);
        }
        this.Cards = [];
        for (let index = 0; index < 52; index++) {
            var rand = Util.getRandomInt(0, cards.length -1);
            this.Cards.push(cards[rand])
            Util.arrayRemoveByIndex(cards, rand);
        }
        this.Slot = [];
        for (let index = 0; index < 4; index++) {
            this.Slot.push(new CardSlot());
        }
    }
}

export class CardSlot{
    Cards : number[] = []

    CaculatePoint(){
        var numb = 0;
        var isOne = false;
        for (let index = 0; index < this.Cards.length; index++) {
            var point = this.Cards[index]%13 + 1
            if(point == 1) isOne = true;
            if(point > 10) point = 10;
            numb += point; 
        }
        if(!isOne) return numb;
        if(numb + 10 > 21) return numb;
        return numb + 10;
    }
}

export class PlayerJoinResult_21J {
    error: string = "";
    playerInfo: PlayerInfo_21J;
}

export class PlayerLeave_21J {
    error: string = "";
    SessionId: string;
}

export class HitCard_21J{
    slot : number;
}
export class ResultHitCard_21J{
    slot : number;
    Cards : number[];
}
export class HoldCardResult_21J{
    Cards : number[];
    HoldCard : number;
}