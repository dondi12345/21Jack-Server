import { Room, Client } from "colyseus";
import { Schema, Context, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player_BJ } from "./Player_BJ";
const type = Context.create(); // this is your @type() decorator bound to a context

export class State_BJ extends Schema{
    @type("number")
    status : number = 0;
    @type({ map: Player_BJ })
    players = new MapSchema<Player_BJ>();
    @type("number")
    timeTurn : number = 0;

    createPlayer(sessionId: string) {
        var player_AAC = new Player_BJ();
        player_AAC.SessionId = sessionId;
        this.players.set(sessionId, player_AAC);
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }
}