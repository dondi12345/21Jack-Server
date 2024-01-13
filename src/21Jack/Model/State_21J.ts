import { Room, Client } from "colyseus";
import { Schema, Context, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player_21J } from "./Player_21J";
const type = Context.create(); // this is your @type() decorator bound to a context

export class State_21J extends Schema{
    @type("number")
    status : number = 0;
    @type({ map: Player_21J })
    players = new MapSchema<Player_21J>();
    @type("number")
    timeTurn : number = 0;

    createPlayer(sessionId: string) {
        var player_AAC = new Player_21J();
        player_AAC.SessionId = sessionId;
        this.players.set(sessionId, player_AAC);
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }
}