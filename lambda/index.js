const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const uuid = require('uuid');

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    console.log(event);

    const parameters3Bucket = process.env.S3_BUCKET;

    var getParams = {
        Bucket: parameters3Bucket, // your bucket name,
        Key: 'test.csv' // path to the object you're looking for
    }

    s3.getObject(getParams, function(err, data) {
        if (err)
            return err;

        let csvData = data.Body.toString('utf-8'); // Use the encoding necessary

        let cells = [];
        var lines = stringFile.split('\n');

        var rowCount = 0;

        for(var i = 0;i < lines.length;i++){
            var columnCount = 0;

            var columns = lines[i].split(',');
            for(var j = 0; j < columns.length;j++) {
                cells.push({
                    "address": {
                        "column": columnCount,
                        "row": rowCount
                    },
                    "formula": columns[j]
                });

                columnCount++;
            }

            rowCount++;
        }

        console.log("CSV Data: " + JSON.stringify(cells));

        const parameterLogin    = process.env.HONEYCODE_LOGIN;
        const parameterPassword = process.env.HONEYCODE_PASSWORD;
        const parameterWorkbook = process.env.HONEYCODE_WORKBOOK;
        const parameterSheet    = process.env.HONEYCODE_SHEET;

        const loginReq = await fetch("https://bhauthngateway.us-east-1.honeycode.aws/v2/login", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json;charset=UTF-8",
                "origin": "https://builder.honeycode.aws"
            },
            "body": JSON.stringify({
                "emailAddress": parameterLogin,
                "password": parameterPassword
            }),
            "method": "POST",
            "mode": "cors"
        });
        
        
        let apitoken = '';
        for (let cookie of loginReq.headers.raw()['set-cookie']) {
            if (cookie.startsWith("bluesky-api-token=")) {
                apitoken = cookie.split("=")[1].split(";")[0];
                console.log("API Token found.");
            }
        }

        const templateReq = await fetch("https://control.us-west-2.honeycode.aws/templatelist-prod.txt", {
            "headers": {
                "accept": "*/*",
                "cookie": "bluesky-api-token=" + apitoken,
                "origin": "https://builder.honeycode.aws"
            },
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        const templateData = await templateReq.json();
        const sheetsRegion = templateData['templates'][0]['arn'].split(":")[3];
        const sheetsAccount = templateData['templates'][0]['arn'].split(":")[4];

        const workbookReq = await fetch("https://control.us-west-2.honeycode.aws/", {
            "headers": {
                "accept": "*/*",
                "content-encoding": "amz-1.0",
                "content-type": "application/json",
                "x-amz-target": "com.amazon.sheets.control.api.SheetsControlServiceAPI_20170701.DescribeWorkbook",
                "x-client-id": "clientRegion|BeehiveSDSJSUtils||||",
                "cookie": "bluesky-api-token=" + apitoken,
                "origin": "https://builder.honeycode.aws"
            },
            "body": JSON.stringify({
                "includeSheetDetail": true,
                "workbook": "arn:aws:sheets:" + sheetsRegion + ":" + sheetsAccount + ":workbook:" + parameterWorkbook
            }),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        const workbookData = await workbookReq.json();

        const updateReq = await fetch("https://" + workbookData['workbook']['endpoint'] + "/external/", {
            "headers": {
                "accept": "application/json, text/javascript, */*",
                "content-encoding": "amz-1.0, amz-1.0",
                "content-type": "application/json",
                "x-amz-target": "com.amazon.sheets.data.external.SheetsDataService.BatchUpdateCell",
                "x-client-id": "prod|Sheets||||",
                "cookie": "bluesky-api-token=" + apitoken,
                "origin": "https://builder.honeycode.aws"
            },
            "body": JSON.stringify({
                "eventType": "BatchUpdateCell",
                "sheetArn": "arn:aws:sheets:" + sheetsRegion + ":" + sheetsAccount + ":sheet:" + parameterWorkbook + "/" + parameterSheet,
                "clientToken": uuid.v4(),
                "cells": cells
            }),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        const updateData = await updateReq.json();
    });
};
