import { Client } from "colyseus";
import { Room_BJ } from "../Model/Room_BJ";
import { CardData_BJ, DealCardPlayer_BJ, DealCard_BJ, PlayerData_BJ, PlayerInfo_BJ, PlayerJoinResult_BJ, PlayerLeave_BJ } from "../Model/PlayerSub_BJ";
import { Config_BJ} from "../Config/Config_BJ";
import { StateStatus_BJ, PlayerStatus_BJ } from "../Config/GameStatus";
import { Util } from "../../Utils/Utils";
import { logCtrl } from "../../Utils/LogCtrl";
import { enumUtils } from "../../Utils/EnumUtils";

export const DealerSessionId = "Dealer"

class Controller_BJ{
    async PlayerJoin(room: Room_BJ, client: Client, playerInfo: PlayerInfo_BJ) {
        room.state.createPlayer(client.sessionId);

        playerInfo.SessionId = client.sessionId;
        room.playerInfoDic.Add(client.sessionId, playerInfo);
        var playerData = new PlayerData_BJ();
        playerData.SessionId = client.sessionId;
        room.playerDataDic.Add(client.sessionId, playerData);

        var playerJoinResult = new PlayerJoinResult_BJ();
        playerJoinResult.playerInfo = playerInfo;

        room.sendToAllClient(Config_BJ.Message_Key_Config.PlayerJoin, playerJoinResult);
        if(room.playerDataDic.Count() >= room.maxClients){
            GameStart(room);
        }
    }

    PlayerLeave(room: Room_BJ, client: Client) {
        if(room.state.status == StateStatus_BJ.Waiting){
            room.playerDataDic.Remove(client.sessionId)
            room.ClientDic.Remove(client.sessionId);
        }else{
            room.ClientDic.Remove(client.sessionId);
        }
        var playerLeave  = new PlayerLeave_BJ();
        playerLeave.SessionId = client.sessionId;
        room.sendToAllClient(Config_BJ.Message_Key_Config.PlayerLeave, playerLeave);
    }

    GetPlayerData(room: Room_BJ, client: Client, sessionId : string){
        var playerData = room.playerDataDic.Get(sessionId);
        room.sendToClient(client.sessionId, Config_BJ.Message_Key_Config.UpdatePlayerData,playerData);
    }

    async PlayerHit(room: Room_BJ, client: Client){
        var player = room.state.players.get(client.sessionId);
        if(player!.status != PlayerStatus_BJ.CardDealing){
            logCtrl.LogMessage("Not turn", client.sessionId);
            return;
        }
        var card = room.Cards[0];
        Util.arrayRemoveByIndex(room.Cards, 0);
        var playerData = room.playerDataDic.Get(client.sessionId);
        for (let index = 0; index < playerData.CardDatas.length; index++) {
            var element =  playerData.CardDatas[index];
            if(!element.Stand){
                element.Cards.push(card);
                element.CaculatePoint();
                if(element.Point >= 21) element.Stand = true;
                break;
            }
        }
        room.sendToAllClient(Config_BJ.Message_Key_Config.UpdatePlayerData,playerData);
        CheckPlayerDone(room, playerData);
    }

    async PlayerStand(room: Room_BJ, client: Client){
        var playerData = room.playerDataDic.Get(client.sessionId);
        for (let index = 0; index < playerData.CardDatas.length; index++) {
            const element = playerData.CardDatas[index];
            if(!element.Stand){
                element.Stand = true;
                break;
            }
        }
        room.sendToAllClient(Config_BJ.Message_Key_Config.UpdatePlayerData,playerData);
        CheckPlayerDone(room, playerData);
    }

    async PlayerSplit(room: Room_BJ, client: Client){
        var playerData = room.playerDataDic.Get(client.sessionId);
        for (let index = 0; index < playerData.CardDatas.length; index++) {
            const element = playerData.CardDatas[index];
            if(!element.Stand){
                if(element.Cards.length == 2){
                    if(element.Cards[0]%13 == element.Cards[1]%13){
                        var splitCD = new CardData_BJ();
                        playerData.CardDatas.push(splitCD);
                        splitCD.Cards.push(element.Cards[1]);
                        Util.arrayRemoveByIndex(element.Cards, 1);
                        room.sendToAllClient(Config_BJ.Message_Key_Config.UpdatePlayerData,playerData);
                    }
                }
                return;
            }
        }
    }

    CheckTime(room: Room_BJ) {
        logCtrl.LogMessage("CheckTime", room.state.timeTurn, enumUtils.ToString(StateStatus_BJ, room.state.status))
        if(room.state.timeTurn <= 0){
            switch (room.state.status) {
                case StateStatus_BJ.Waiting:
                    GameStart(room);
                    break;
                case StateStatus_BJ.DealMoney:
                    DealingCard(room);
                    break;
                case StateStatus_BJ.DealCard:
                    PlayerDeal(room);
                    break;
                case StateStatus_BJ.PlayerDeal:
                    PlayerDeal(room);
                    break;
                case StateStatus_BJ.DealerDealing:
                    DealerDealing(room);
                    break;
                default:
                    break;
            }
        }
        // if (room.state.timeTurn < TimeConfig.BotStartJoin && room.state.status == StateStatus_AAC.Lobby && room.state.timeTurn % TimeConfig.DelayBotJoin == 0) {
        //     if (room.locked) return;
        //     if (Math.random() < 0.3) {
        //         //TUdt random de bot vao lệch nhau
        //         var bot = new Bot_AAC();
        //         bot.Start();
        //     }

        // }
    }
}

export const controller_BJ = new Controller_BJ();

async function GameStart(room: Room_BJ) {
    // await delay(TimeConfig.TimeDelayStart * 1000);
    console.log("GameStart");
    room.lock();
    room.state.timeTurn = Config_BJ.TimeConfig.TimePlayerDealMoney;
    room.state.status = StateStatus_BJ.DealMoney;
}

async function DealingCard(room: Room_BJ){
    room.state.timeTurn = Config_BJ.TimeConfig.DealCardStart;
    room.state.status = StateStatus_BJ.DealCard;
    room.sendToAllClient(Config_BJ.Message_Key_Config.GameStart, 1);
    room.SufferCard();
    var dealCard = new DealCard_BJ();
    //player dealing
    room.playerDataDic.Keys().forEach(element => {
        var dealCardPlayer = new DealCardPlayer_BJ();
        dealCardPlayer.SessionId = element;
        var playerData = room.playerDataDic.Get(element)
        playerData.ResetCard();
        playerData.CardDatas.push(new CardData_BJ());
        playerData.CardDatas[0].Cards.push(room.Cards[0]);
        dealCardPlayer.Cards.push(room.Cards[0]);
        Util.arrayRemoveByIndex(room.Cards, 0);
        playerData.CardDatas[0].Cards.push(room.Cards[0]);
        dealCardPlayer.Cards.push(room.Cards[0]);
        Util.arrayRemoveByIndex(room.Cards, 0);
        dealCard.DealCardPlayers.push(dealCardPlayer);
        playerData.CardDatas[0].CaculatePoint();
        room.state.players.get(element)!.status = PlayerStatus_BJ.None;
    });
    //dealer dealing
    room.Dealer = new PlayerData_BJ();
    room.Dealer.SessionId = DealerSessionId;
    var dealCardPlayer = new DealCardPlayer_BJ();
    dealCardPlayer.SessionId = DealerSessionId;
    room.Dealer.CardDatas.push(new CardData_BJ());
    room.Dealer.CardDatas[0].Cards.push(room.Cards[0])
    dealCardPlayer.Cards.push(room.Cards[0]);
    Util.arrayRemoveByIndex(room.Cards, 0);
    dealCard.DealCardPlayers.push(dealCardPlayer);
    room.Dealer.CardDatas[0].CaculatePoint();
    room.sendToAllClient(Config_BJ.Message_Key_Config.DealCard, dealCard);
}

async function PlayerDeal(room: Room_BJ) {
    room.state.status = StateStatus_BJ.PlayerDeal;
    room.state.timeTurn = Config_BJ.TimeConfig.TimePlayerDealCard;
    var key = room.ClientDic.Keys();
    var allPlayerDone = true;
    for (let index = 0; index < key.length; index++) {
        const element = key[index];
        var player = room.state.players.get(element);
        if(player!.status == PlayerStatus_BJ.CardDealing){
            player!.status = PlayerStatus_BJ.CardDealingDone;
        }
        if(player!.status == PlayerStatus_BJ.None){
            player!.status = PlayerStatus_BJ.CardDealing;
            allPlayerDone = false;
            return;
        }
    }
    if(allPlayerDone){
        room.state.status = StateStatus_BJ.DealerDealing;
    }
}

async function CheckPlayerDone(room : Room_BJ, playerData : PlayerData_BJ){
    var isDone = true;
    for (let index = 0; index < playerData.CardDatas.length; index++) {
        const element = playerData.CardDatas[index];
        if(!element.Stand) {
            isDone = false;
            break;
        }
    }
    if(isDone){
        room.state.timeTurn = 0;
    }
    logCtrl.LogMessage("CheckPlayerDone", playerData.SessionId, isDone);
}

async function DealerDealing(room : Room_BJ) {
    if(room.Dealer.CardDatas[0].Cards.length < 2){
        room.Dealer.CardDatas[0].Cards.push(room.Cards[0])
        Util.arrayRemoveByIndex(room.Cards, 0);
        room.sendToAllClient(Config_BJ.Message_Key_Config.UpdatePlayerData,room.Dealer);
    }
}