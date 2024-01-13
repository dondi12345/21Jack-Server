import { Client } from "colyseus";
import { Room_BJ } from "../Model/Room_BJ";
import { CardData_BJ, PlayerData_BJ, PlayerInfo_BJ, PlayerJoinResult_BJ, PlayerLeave_BJ } from "../Model/PlayerSub_BJ";
import { Message_Key_Config, TimeConfig } from "../Config/Config_BJ";
import { GameState_BJ } from "../Config/GameStatus";

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

        room.sendToAllClient(Message_Key_Config.PlayerJoin, playerJoinResult);
        if(room.playerDataDic.Count() >= room.maxClients){
            GameStart();
        }
    }

    PlayerLeave(room: Room_BJ, client: Client) {
        if(room.state.status == GameState_BJ.Waiting){
            room.playerDataDic.Remove(client.sessionId)
            room.ClientDic.Remove(client.sessionId);
        }else{
            room.ClientDic.Remove(client.sessionId);
        }
        var playerLeave  = new PlayerLeave_BJ();
        playerLeave.SessionId = client.sessionId;
        room.sendToAllClient(Message_Key_Config.PlayerLeave, playerLeave);
    }

    async PlayerHit(room: Room_BJ, client: Client){

    }

    async PlayerStand(room: Room_BJ, client: Client){

    }

    CheckTime(room: Room_BJ) {
        if(room.state.timeTurn <= 0){
            switch (room.state.status) {
                case GameState_BJ.Waiting:
                    GameStart(room);
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
    room.state.timeTurn = TimeConfig.DealCardStart;
    console.log("GameStart");
    room.lock();
    room.state.status = GameState_BJ.DealCard;

    room.SufferCard();
    room.playerDataDic.Keys().forEach(element => {
        var playerData = room.playerDataDic.Get(element)
        playerData.ResetCard();
        playerData.Card.Cards.push(room.Cards[0]);
        playerData.Ca
    });


    room.state.timeTurn = Round.prepare_before_round_start;
    room.state.round = 1;
    room.TotalRankPoint = 0;
    room.state.players.forEach(playerData => {
        try {
            var point = room.playerInfoDic.Get(playerData.SessionId).RankPoint;
            if (point == null || point == undefined) room.TotalRankPoint += 1000;
            else room.TotalRankPoint += point;
        } catch (error) {

        }
        playerData.gold = Start_Config.Gold;
        playerData.exp = Start_Config.Exp;
        playerData.lv = Start_Config.Lv;
        playerData.hp = Start_Config.Hp;
        playerData.status = PlayerStatus_AAC.NotReady;
        var playerShopData = new PlayerShopData_AAC();
        playerShopData.SessionId = playerData.SessionId;

        //Give started chess
        var index = Math.floor(Math.random() * room.ChessOneGold.length);
        var chessStartData = room.ChessOneGold[index];
        room.ChessOneGold.splice(index, 1);
        room.ShopChess.Remove(chessStartData._id);

        var chessData = new ChessData_AAC();
        chessData._id = chessStartData._id;
        chessData.Index = chessStartData.Index;
        chessData.Slot = 0;

        var playerChessData = room.PlayerChessDataDic.Get(playerData.SessionId);
        playerChessData.Chesses.push(chessData);

        playerShopData.Chesses = GetRandomChessForShop(room, playerData.SessionId, playerData.lv);

        var gameStartResult = new GameStartResult_AAC();
        gameStartResult.playerShopData = playerShopData;
        gameStartResult.playerChessData = playerChessData;
        gameStartResult.chessStart = chessData;
        room.sendToClient(playerData.SessionId, Message_Key_Config.GameStart, gameStartResult);
    })
}
