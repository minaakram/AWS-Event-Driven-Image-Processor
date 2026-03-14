const POLLING = (function() {
    const STATUS_ENUM = {
        0: "Sent to S3",
        1: "App server got original image buffer",
        2: "Processed image",
        3: "Complete"
    };

    const AWS = require("aws-sdk");
    const SHARP = require("sharp");
    const CONFIG = require("./config.js");

    // These should point to the helper files if you have them, 
    // or mocked for documentation purposes.
    const S3_HELPER = require("./s3_helper.js");
    const DYNAMO_HELPER = require("./dynamo_helper.js");

    const SQS_API = new AWS.SQS({
        apiVersion: CONFIG.SQS.API_VERSION_STR,
        region: CONFIG.SQS.REGION_STR
    });

    let _keep_polling_boo = false;
    const QUEUE_URL = CONFIG.SQS.QUEUE_URL_STR;

    async function runner() {
        while (_keep_polling_boo === true) {
            try {
                const params = {
                    QueueUrl: QUEUE_URL,
                    MaxNumberOfMessages: 1,
                    WaitTimeSeconds: 5
                };

                const response = await SQS_API.receiveMessage(params).promise();

                if (!response.Messages) {
                    console.log("No messages to process. Polling again...");
                    continue;
                }

                const receipt_handle = response.Messages[0].ReceiptHandle;
                const body = JSON.parse(response.Messages[0].Body);
                const message = JSON.parse(body.Message);
                const full_image_id = message.Records[0].s3.object.key;

                if (full_image_id.indexOf("_300_300.png") !== -1) {
                    await removeFromQueue(receipt_handle);
                    continue;
                }

                console.log("Processing image ID:", full_image_id);
                await processImage(full_image_id.replace(".png", ""), receipt_handle);
            } catch (error) {
                console.error("SQS Polling Error:", error);
            }
        }
    }

    async function processImage(image_id, receipt_handle) {
        try {
            await DYNAMO_HELPER.setStatus(image_id, STATUS_ENUM[1]);
            const img_buffer = await S3_HELPER.getImage(image_id);

            const processed = await SHARP(img_buffer)
                .tint({ r: 255, g: 240, b: 16 })
                .resize(300, 300)
                .png()
                .toBuffer();

            await DYNAMO_HELPER.setStatus(image_id, STATUS_ENUM[2]);
            await S3_HELPER.saveAdjusted(image_id, processed);
            await DYNAMO_HELPER.setStatus(image_id, STATUS_ENUM[3]);

            await removeFromQueue(receipt_handle);
            console.log("Successfully processed:", image_id);
        } catch (e) {
            console.error("Image Processing Error:", e);
        }
    }

    async function removeFromQueue(receipt_handle) {
        const delete_params = {
            QueueUrl: QUEUE_URL,
            ReceiptHandle: receipt_handle
        };
        await SQS_API.deleteMessage(delete_params).promise();
    }

    return {
        start: async (req, res, next) => {
            _keep_polling_boo = true;
            console.log("Polling started on:", QUEUE_URL);
            runner();
            next();
        },
        stop: async (req, res, next) => {
            _keep_polling_boo = false;
            console.log("Polling stopped.");
            next();
        }
    };
})();

module.exports = POLLING;
