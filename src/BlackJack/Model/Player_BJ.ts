import { Schema, Context } from "@colyseus/schema";
const type = Context.create(); // this is your @type() decorator bound to a context


export class Player_BJ extends Schema{
    @type("string")
    SessionId: string = "";
    @type("number")
    status: number = 0;
    @type("number")
    gold: number = 0;
}