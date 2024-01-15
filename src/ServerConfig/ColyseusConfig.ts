import config from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import serveIndex from 'serve-index';
import express from 'express';
import { Room_21J } from "../21Jack/Model/Room_21J";
import { Room_BJ } from "../BlackJack/Model/Room_BJ";
// import { uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

// Import demo room handlers

export const configColyseus = config({
    options: {

    },

    initializeGameServer: (gameServer) => {
        // Define "lobby" room
        // Define "state_handler" room

        gameServer.define("21J", Room_21J)
        .enableRealtimeListing();
        gameServer.define("BJ", Room_BJ)
        .enableRealtimeListing();

        gameServer.onShutdown(function(){
            console.log(`game server is going down.`);
        });


    },

    initializeExpress: (app) => {
        app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))
        app.use('/', express.static(path.join(__dirname, "static")));

        // (optional) client playground
        // app.use('/playground', playground);

        // (optional) web monitoring panel
        app.use('/colyseus', monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
