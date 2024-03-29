import { Client, Delayed, Room } from "colyseus";
import { NTDictionary } from "../../Utils/NTDictionary";
import { State_21J } from "./State_21J";
import { DataModel } from "../../Utils/DataModel";
import { Util } from "../../Utils/Utils";
import { PlayerData_21J, HitCard_21J, PlayerInfo_21J } from "./PlayerSub_21J";
import { Config_21J } from "../Config/Config_21J";
import { controller_21J } from "../Controller/Controller_21J";
import { GameState_21J } from "../Config/GameState_21J";
import { logCtrl } from "../../Utils/LogCtrl";

export class Room_21J extends Room<State_21J> {
    maxClients: number = 2;

    ClientDic : NTDictionary<Client>;
    playerInfoDic : NTDictionary<PlayerInfo_21J>;
    playerDataDic : NTDictionary<PlayerData_21J>;
 
    delayedInterval!: Delayed;

    IsCaculate : boolean = false;

    Bet : number = 5;

    onCreate(options: any){
        console.log("Room_21J created!", options);
        var playerInfo = DataModel.Parse<PlayerInfo_21J>(options);
        this.Bet = playerInfo.Bet;
        this.setMetadata({Bet : this.Bet})
        var state = new State_21J();
        this.setState(state);
        this.InitRoom();
        this.onMessage("message", (client, data)=>{
        })
        this.onMessage(Config_21J.Message_Key_Config.PlayerHitCard, (client, data : HitCard_21J)=>{
            logCtrl.LogMessage(client.sessionId, "PlayerHitCard", JSON.stringify(data))
            controller_21J.PlayerHitCard(this, client, data)
        })
        this.onMessage(Config_21J.Message_Key_Config.GetPlayerData, (client, data)=>{
            logCtrl.LogMessage(client.sessionId, "GetPlayerData", JSON.stringify(data))
            controller_21J.GetPlayerData(this, client);
        })
        this.onMessage(Config_21J.Message_Key_Config.HoldCard, (client, data)=>{
            logCtrl.LogMessage(client.sessionId, "HoldCard", JSON.stringify(data))
            controller_21J.HoldCard(this, client);
        })
        this.onMessage(Config_21J.Message_Key_Config.HitHoldCard, (client, data : HitCard_21J)=>{
            logCtrl.LogMessage(client.sessionId, "HitHoldCard", JSON.stringify(data))
            controller_21J.HitHoldCard(this, client, data);
        })
        this.delayedInterval = this.clock.setInterval(() => {
            this.state.timeTurn--;
            //console.log("Time: "+this.state.timeTurn);
            controller_21J.CheckTime(this);
        }, 1000);
    }

    onJoin (client: Client, options) {
        this.ClientDic.Add(client.sessionId, client);
        var playerInfo = DataModel.Parse<PlayerInfo_21J>(options);
        console.log(client.sessionId + ": Join", playerInfo)
        controller_21J.PlayerJoin(this, client, playerInfo);
        console.log("Metadata", this.metadata);
    }

    onLeave (client) {
        this.ClientDic.Remove(client.sessionId);
        console.log(client.sessionId + ": Left")
        controller_21J.PlayerLeave(this, client);
    }

    InitRoom(){
        this.state.timeTurn = Config_21J.TimeConfig.TimeWaitStart;
        this.state.status = GameState_21J.Waiting;
        this.ClientDic = new NTDictionary<Client>();
        this.playerInfoDic = new NTDictionary<PlayerInfo_21J>();
        this.playerDataDic = new NTDictionary<PlayerData_21J>();
    }

    sendToAllClient(key : string ,data){
        this.broadcast(key, data)
    }

    sendToClient(sessionId : string, key : string, data){
        logCtrl.LogMessage(sessionId, key, data)
        try {
            var client =  this.ClientDic.Get(sessionId);
            if(client == null || client == undefined) return;
            client.send(key, data);
        } catch (error) {
            
        }
    }
}