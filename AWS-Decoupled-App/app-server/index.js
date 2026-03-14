const EXPRESS = require("express");
const APP = EXPRESS();
const POLLING = require("./libs/polling.js");
const PORT = 8010;

APP.get("/", (req, res) => {
    res.send("Image Processing Application Server is running.");
});

APP.get("/start", POLLING.start, (req, res) => {
    res.status(200).send("SQS Polling initiated successfully.");
});

APP.get("/stop", POLLING.stop, (req, res) => {
    res.status(200).send("SQS Polling terminated.");
});

APP.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});
