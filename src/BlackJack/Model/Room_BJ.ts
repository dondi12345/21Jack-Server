import { Client, Delayed, Room } from "colyseus";
import { NTDictionary } from "../../Utils/NTDictionary";
import { State_BJ } from "./State_BJ";
import { DataModel } from "../../Utils/DataModel";
import { PlayerData_BJ, PlayerInfo_BJ } from "./PlayerSub_BJ";
import { Util } from "../../Utils/Utils";
import { controller_BJ } from "../Controller/Controller_BJ";
import { Config_BJ } from "../Config/Config_BJ";

export class Room_BJ extends Room<State_BJ> {
    maxClients: number = 1;

    ClientDic : NTDictionary<Client>;
    playerInfoDic : NTDictionary<PlayerInfo_BJ>;
    playerDataDic : NTDictionary<PlayerData_BJ>;

    Dealer : PlayerData_BJ;
    Cards : number[] = [];

    
    delayedInterval!: Delayed;

    IsCaculate : boolean = false;

    onCreate(options: any){
        //console.log("Room_AAC created!", options);
        var state = new State_BJ();
        this.setState(state);
        this.InitRoom();
        this.onMessage("message", (client, data)=>{
        })
        this.onMessage(Config_BJ.Message_Key_Config.PlayerJoin, (client, data)=>{
            controller_BJ.PlayerHit(this, client)
        })
        this.onMessage(Config_BJ.Message_Key_Config.GetPlayerData, (client, data : string)=>{
            controller_BJ.GetPlayerData(this, client, data)
        })
        this.delayedInterval = this.clock.setInterval(() => {
            this.state.timeTurn--;
            //console.log("Time: "+this.state.timeTurn);
            controller_BJ.CheckTime(this);
        }, 1000);
    }

    onJoin (client: Client, options) {
        this.ClientDic.Add(client.sessionId, client);
        console.log(this.ClientDic.Get(client.sessionId).sessionId)
        console.log(client.sessionId + ": Join", options)
        var playerInfo = DataModel.Parse<PlayerInfo_BJ>(options);
        controller_BJ.PlayerJoin(this, client, playerInfo);
    }

    onLeave (client) {
        this.ClientDic.Remove(client.sessionId);
        console.log(client.sessionId + ": Left")
        controller_BJ.PlayerLeave(this, client);
    }

    InitRoom(){
        this.playerInfoDic = new NTDictionary<PlayerInfo_BJ>();
        this.playerDataDic = new NTDictionary<PlayerData_BJ>();
        this.ClientDic = new NTDictionary<Client>();
    }

    SufferCard(){
        var cards : number[] = [];
        for (let index = 1; index <= 52; index++) {
            cards.push(index);
        }
        this.Cards = [];
        for (let index = 0; index < 52; index++) {
            var rand = Util.getRandomInt(0, cards.length -1);
            this.Cards.push(cards[rand])
            Util.arrayRemoveByIndex(cards, rand);
        }
    }

    sendToAllClient(key : string ,data){
        this.broadcast(key, data)
    }

    sendToClient(sessionId : string, key : string, data){
        try {
            var client =  this.ClientDic.Get(sessionId);
            if(client == null || client == undefined) return;
            client.send(key, data);
        } catch (error) {
            
        }
    }
}