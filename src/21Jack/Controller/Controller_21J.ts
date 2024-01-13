import { Client } from "colyseus";
import { Room_21J } from "../Model/Room_21J";
import { PlayerData_21J, HitCard_21J, PlayerInfo_21J, PlayerJoinResult_21J, PlayerLeave_21J, ResultHitCard_21J } from "../Model/PlayerSub_21J";
import { Config_21J } from "../Config/Config_21J";
import { GameState_21J } from "../Config/GameState_21J";
import { Util } from "../../Utils/Utils";
import { logCtrl } from "../../Utils/LogCtrl";
import { enumUtils } from "../../Utils/EnumUtils";

class Controller_21J{
    async PlayerJoin(room: Room_21J, client: Client, playerInfo: PlayerInfo_21J) {
        room.state.createPlayer(client.sessionId);

        playerInfo.SessionId = client.sessionId;
        room.playerInfoDic.Add(client.sessionId, playerInfo);
        var playerData = new PlayerData_21J();
        playerData.SessionId = client.sessionId;
        room.playerDataDic.Add(client.sessionId, playerData);

        var playerJoinResult = new PlayerJoinResult_21J();
        playerJoinResult.playerInfo = playerInfo;

        room.sendToAllClient(Config_21J.Message_Key_Config.PlayerJoin, playerJoinResult);
        if(room.playerDataDic.Count() >= room.maxClients){
            StartGame(room);
        }
    }

    PlayerLeave(room: Room_21J, client: Client) {
        if(room.state.status == GameState_21J.Waiting){
            room.playerDataDic.Remove(client.sessionId)
            room.ClientDic.Remove(client.sessionId);
        }else{
            room.ClientDic.Remove(client.sessionId);
        }
        if(room.ClientDic.Count() == 0){
            room.disconnect();
            return;
        }
        var playerLeave  = new PlayerLeave_21J();
        playerLeave.SessionId = client.sessionId;
        room.sendToAllClient(Config_21J.Message_Key_Config.PlayerLeave, playerLeave);
    }

    PlayerHitCard(room : Room_21J, client : Client, hitCard : HitCard_21J){
        var playerData = room.playerDataDic.Get(client.sessionId)
        var cardSlot = playerData.Slot[hitCard.slot];
        var card = playerData.Cards[0];
        cardSlot.Cards.push(card)
        Util.arrayRemoveByIndex(playerData.Cards, 0);
        var point = cardSlot.CaculatePoint();
        for (let index = 0; index < playerData.WhiteCard.length; index++) {
            const element = playerData.WhiteCard[index];
            if(card == element) point = 21;
        }
        var playerState = room.state.players.get(client.sessionId);
        if(point > 21){
            playerState!.health --;
            if(playerState!.health <= 0){
                room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.PlayerLose, 1)
            }
            cardSlot.Cards = [];
        }
        if(point == 21){
            playerState!.score += cardSlot.Cards.length;
            cardSlot.Cards = [];
        }

        if(cardSlot.Cards.length >= 5) cardSlot.Cards = [];
        var result = new ResultHitCard_21J();
        result.slot = hitCard.slot;
        result.Cards = cardSlot.Cards;
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.PlayerHitCard, result);
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.UpdatePlayerCards, playerData.Cards);
    }

    async GetPlayerData(room : Room_21J, client : Client){
        var playerData = room.playerDataDic.Get(client.sessionId);
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.UpdatePlayerData, playerData);
    }

    async CheckTime(room: Room_21J){
        logCtrl.LogMessage("CheckTime", room.state.timeTurn, enumUtils.ToString(GameState_21J, room.state.status))
        if(room.state.timeTurn <= 0){
            switch (room.state.status) {
                case GameState_21J.Waiting:
                    StartGame(room)
                    break;
                case GameState_21J.Playing:
                    EndGame(room)
                    break;
                default:
                    break;
            }
        }
    }
}

export const controller_21J = new Controller_21J();

function StartGame(room: Room_21J){
    room.state.timeTurn = Config_21J.TimeConfig.DurationPlayer;
    room.state.status = GameState_21J.Playing;
    room.sendToAllClient(Config_21J.Message_Key_Config.GameStart, 1);
    var keys = room.playerDataDic.Keys();
    for (let index = 0; index < keys.length; index++) {
        const element = keys[index];
        var playerData = room.playerDataDic.Get(element);
        playerData.ResetData();
        var player = room.state.players.get(element);
        player!.health = Config_21J.PlayerConfig.HealthStart; 
        room.sendToClient(playerData.SessionId, Config_21J.Message_Key_Config.UpdatePlayerData, playerData);
    }
}

function EndGame(room : Room_21J){

}