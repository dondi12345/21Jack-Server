class LogCtrl {
    LogDev(...str) {
        console.log("\x1b[37m" + str);
    }

    LogMessage(...data) {
        console.log("\x1b[32m", "Message", data);
    }
    LogWarring(...data) {
        console.log("\x1b[33m", "Warrning", data);
    }

    LogError(...data) {
        console.log("\x1b[31m", "Error", data);
    }
}

export const logCtrl = new LogCtrl();