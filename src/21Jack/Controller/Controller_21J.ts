import { Client } from "colyseus";
import { Room_21J } from "../Model/Room_21J";
import { PlayerData_21J, HitCard_21J, PlayerInfo_21J, PlayerJoinResult_21J, PlayerLeave_21J, ResultHitCard_21J, HoldCardResult_21J, CardSlot, ResultHitHoldCard_21J } from "../Model/PlayerSub_21J";
import { Config_21J } from "../Config/Config_21J";
import { GameState_21J } from "../Config/GameState_21J";
import { Util } from "../../Utils/Utils";
import { logCtrl } from "../../Utils/LogCtrl";
import { enumUtils } from "../../Utils/EnumUtils";

class Controller_21J {
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
        if (room.playerDataDic.Count() >= room.maxClients) {
            StartGame(room);
        }
    }

    PlayerLeave(room: Room_21J, client: Client) {
        if (room.state.status == GameState_21J.Waiting) {
            room.playerDataDic.Remove(client.sessionId)
            room.ClientDic.Remove(client.sessionId);
        } else {
            room.ClientDic.Remove(client.sessionId);
        }
        if (room.ClientDic.Count() == 0) {
            room.disconnect();
            return;
        }
        var playerLeave = new PlayerLeave_21J();
        playerLeave.SessionId = client.sessionId;
        room.sendToAllClient(Config_21J.Message_Key_Config.PlayerLeave, playerLeave);
    }

    PlayerHitCard(room: Room_21J, client: Client, hitCard: HitCard_21J) {
        var playerData = room.playerDataDic.Get(client.sessionId)
        hitCard.slot = hitCard.slot % 4;
        var cardSlot = playerData.Slot[hitCard.slot];
        var card = playerData.Cards[0];
        Util.arrayRemoveByIndex(playerData.Cards, 0);
        
        AnalyzeHitCard(room, cardSlot, card, playerData, hitCard.slot);

        var result = new ResultHitCard_21J();
        result.slot = hitCard.slot;
        result.CardSlot = cardSlot;
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.PlayerHitCard, result);
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.UpdatePlayerCards, playerData.Cards);
    }

    async GetPlayerData(room: Room_21J, client: Client) {
        var playerData = room.playerDataDic.Get(client.sessionId);
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.UpdatePlayerData, playerData);
    }
    async HoldCard(room: Room_21J, client: Client) {
        var playerData = room.playerDataDic.Get(client.sessionId);
        if (playerData.HoldCard < 0) {
            playerData.HoldCard = playerData.Cards[0];
            Util.arrayRemoveByIndex(playerData.Cards, 0);
        } else {
            var card = playerData.HoldCard;
            playerData.HoldCard = playerData.Cards[0];
            playerData.Cards[0] = card;
        }
        var holdCardResult = new HoldCardResult_21J();
        holdCardResult.Cards = playerData.Cards;
        holdCardResult.HoldCard = playerData.HoldCard;
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.HoldCard, holdCardResult);
    }

    async HitHoldCard(room: Room_21J, client: Client, hitCard: HitCard_21J) {
        var playerData = room.playerDataDic.Get(client.sessionId);
        if (playerData.HoldCard < 0) return;
        hitCard.slot = hitCard.slot % 4;
        var cardSlot = playerData.Slot[hitCard.slot];
        var card = playerData.HoldCard;
        playerData.HoldCard = -1;

        AnalyzeHitCard(room, cardSlot, card, playerData, hitCard.slot);

        var result = new ResultHitHoldCard_21J();
        result.slot = hitCard.slot;
        result.CardSlot = cardSlot;
        room.sendToClient(client.sessionId, Config_21J.Message_Key_Config.PlayerHitHoldCard, result);
    }

    async CheckTime(room: Room_21J) {
        logCtrl.LogMessage("CheckTime", room.state.timeTurn, enumUtils.ToString(GameState_21J, room.state.status))
        if (room.state.timeTurn <= 0) {
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

function StartGame(room: Room_21J) {
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

function EndGame(room: Room_21J) {
    room.sendToAllClient(Config_21J.Message_Key_Config.PlayerLose, 1);
}

function AnalyzeHitCard(room: Room_21J, cardSlot: CardSlot, card: number, playerData : PlayerData_21J, slot : number) {
    cardSlot.Cards.push(card)
    cardSlot.CaculatePoint();
    for (let index = 0; index < playerData.WhiteCard.length; index++) {
        const element = playerData.WhiteCard[index];
        if (card == element) cardSlot.Point = 21;
    }
    var playerState = room.state.players.get(playerData.SessionId);
    if (cardSlot.Point > 21) {
        room.sendToClient(playerData.SessionId, Config_21J.Message_Key_Config.Burst, [0, slot])
        playerState!.health--;
        if (playerState!.health <= 0) {
            room.sendToClient(playerData.SessionId, Config_21J.Message_Key_Config.PlayerLose, 1)
        }
        cardSlot.Cards = [];
    }
    if (cardSlot.Point == 21) {
        room.sendToClient(playerData.SessionId, Config_21J.Message_Key_Config.BlackJack, [Config_21J.PointConfig.BlackJack, slot])
        playerState!.score += Config_21J.PointConfig.BlackJack;
        cardSlot.Cards = [];
    }

    if (cardSlot.Cards.length >= 5) {
        room.sendToClient(playerData.SessionId, Config_21J.Message_Key_Config.Clear, [0, slot])
        cardSlot.Cards = [];
    }
    cardSlot.CaculatePoint();
}