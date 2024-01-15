import { Player_BJ } from "./Player_BJ";

export class PlayerInfo_BJ {
    ID: string;
    SessionId: string;
    Name: string;
    Avata: string;
}

export class PlayerData_BJ {
    SessionId: string;
    CardDatas : CardData_BJ[] = []

    ResetCard() {
        this.CardDatas = [];
    }
}

export class CardData_BJ {
    Cards: number[] = [];
    Stand: boolean = false;
    Point : number;
    CaculatePoint(){
        this.Point = 0;
        var isOne = false;
        for (let index = 0; index < this.Cards.length; index++) {
            var point = this.Cards[index]%13 + 1
            if(point == 1) isOne = true;
            if(point > 10) point = 10;
            this.Point += point; 
        }
        if(isOne){
            if(this.Point + 10 <= 21){
                this.Point += 10;
            }
        }
    }
}

export class PlayerJoinResult_BJ {
    error: string = "";
    playerInfo: PlayerInfo_BJ;
}
export class PlayerLeave_BJ {
    error: string = "";
    SessionId: string;
}

export class DealCard_BJ {
    DealCardPlayers: DealCardPlayer_BJ[] = []
}

export class DealCardPlayer_BJ {
    SessionId: string;
    Cards: number[] = [];
}