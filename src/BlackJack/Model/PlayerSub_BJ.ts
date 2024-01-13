import { Player_BJ } from "./Player_BJ";

export class PlayerInfo_BJ {
    ID: string;
    SessionId: string;
    Name: string;
    Avata: string;
}

export class PlayerData_BJ{
    SessionId: string;
    Card : CardData_BJ = new CardData_BJ();
    SlipCard : CardData_BJ = new CardData_BJ();

    ResetCard(){
        this.Card = new CardData_BJ();
        this.SlipCard = new CardData_BJ();
    }
}

export class CardData_BJ{
    Cards : number[] = [];
}

export class PlayerJoinResult_BJ {
    error: string = "";
    playerInfo: PlayerInfo_BJ;
}
export class PlayerLeave_BJ {
    error: string = "";
    SessionId: string;
}