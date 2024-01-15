import { Player_BJ } from "./Player_BJ";

export class PlayerInfo_BJ {
    ID: string;
    SessionId: string;
    Name: string;
    Avata: string;
}

export class PlayerData_BJ {
    SessionId: string;
    Card: CardData_BJ = new CardData_BJ();
    Stand: boolean = false;
    SlipCard: CardData_BJ = new CardData_BJ();
    StandSlip: boolean = false;

    ResetCard() {
        this.Card = new CardData_BJ();
        this.SlipCard = new CardData_BJ();
        this.Stand = false;
        this.StandSlip = false;
    }
}

export class CardData_BJ {
    Cards: number[] = [];
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