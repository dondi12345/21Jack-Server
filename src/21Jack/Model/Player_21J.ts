import { Schema, Context } from "@colyseus/schema";
const type = Context.create(); // this is your @type() decorator bound to a context


export class Player_21J extends Schema{
    @type("string")
    SessionId: string = "";
    @type("number")
    score: number = 0;
    @type("number")
    health: number = 0;
}