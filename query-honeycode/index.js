const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const uuid = require('uuid');
const yargs = require('yargs');

const argv = yargs
    .command('workbooks', 'Print list of workbooks in Honeycode.', {
    })
    .command('tables', 'Print list of tables from specific workbook in Honeycode.', {
        workbook: {
            description: 'UUID of specific workbook',
            alias: 'w',
            type: 'string',
        }
    })
    .option('username', {
        alias: 'u',
        description: 'Honeycode Username',
        type: 'string',
    })
    .option('password', {
        alias: 'p',
        description: 'Honeycode Password',
        type: 'string',
    })
    .option('workbook', {
        alias: 'w',
        description: 'Workboon UUID, required for tables',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

async function workbooks() {
    const parameterLogin    = argv.username;
    const parameterPassword = argv.password;

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
        }
    }

    const loggedInUserReq = await fetch("https://bhauthngateway.us-east-1.honeycode.aws/v2/logged-in-user-profile", {
        "headers": {
            "accept": "*/*",
            "content-encoding": "amz-1.0",
            "content-type": "application/json",
            "cookie": "bluesky-api-token=" + apitoken,
            "origin": "https://builder.honeycode.aws"
        },
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });

    const loggedInUserData = await loggedInUserReq.json();
    const ownerId = loggedInUserData.userProfile.userId;

    const controlReq = await fetch("https://control.us-west-2.honeycode.aws/", {
        "headers": {
            "accept": "*/*",
            "content-encoding": "amz-1.0",
            "content-type": "application/json",
            "x-amz-target": "com.amazon.sheets.control.api.SheetsControlServiceAPI_20170701.DescribeAttacheWorkbook",
            "x-client-id": "clientRegion|BeehiveSDSJSUtils||||",
            "cookie": "bluesky-api-token=" + apitoken,
            "origin": "https://builder.honeycode.aws"
        },
        "body": JSON.stringify({"attacheWorkbookType": "user_attache", "ownerId": ownerId}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    const controlData = await controlReq.json();
    const workbookArn = controlData.workbook;

    const tableReq = await fetch("https://pod11.dp.us-west-2.honeycode.aws/external/", {
        "headers": {
            "accept": "*/*",
            "content-encoding": "amz-1.0",
            "content-type": "application/json",
            "x-amz-target": "com.amazon.sheets.data.external.SheetsDataService.ListTables",
            "x-client-id": "clientRegion|BeehiveSDSJSUtils||||",
            "cookie": "bluesky-api-token=" + apitoken,
            "origin": "https://builder.honeycode.aws"
        },
        "body": JSON.stringify({"workbookArn":workbookArn}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    const tableData = await tableReq.json();
    var tableArn = "";

    var rowCount = tableData.items.length;
    for (var i=0; i< rowCount; i++) {
        if(tableData.items[i].tableName  === "AttacheAssetsTable") {
            tableArn = tableData.items[i].tableArn;
        }
    }

    const workbookReq = await fetch("https://pod11.dp.us-west-2.honeycode.aws/external/", {
        "headers": {
            "accept": "*/*",
            "content-encoding": "amz-1.0",
            "content-type": "application/json",
            "x-amz-target": "com.amazon.sheets.data.external.SheetsDataService.QueryTableRowsByFilter",
            "x-client-id": "clientRegion|BeehiveSDSJSUtils||||",
            "cookie": "bluesky-api-token=" + apitoken,
            "origin": "https://builder.honeycode.aws"
        },
        "body": JSON.stringify({"tableArn":tableArn}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    const workbookData = await workbookReq.json();

    var foundWorkbooks = [];
    var rowCount = workbookData.tableRows.length;
    for (var i=0; i< rowCount; i++) {
       var contentCount = workbookData.tableRows[i].tableRowContent.length;
       for (var j = 0; j < contentCount; j++) {
           var workbook, workbookUUID = "";
           if(workbookData.tableRows[i].tableRowContent[j].address.column == 3) {
               workbook = workbookData.tableRows[i].tableRowContent[j].formattedValue;
           }
           if(workbookData.tableRows[i].tableRowContent[j].address.column == 4) {
               workbookUUID = workbookData.tableRows[i].tableRowContent[j].formattedValue;
           }

           var index = foundWorkbooks.findIndex(x => x.workbookUUID==workbookUUID)
           if (workbook !== "" && workbookUUID !== "" && index === -1){
               foundWorkbooks.push({"workbook": workbook, "workbookUUID": workbookUUID});
           }
       }
    }

    var workbookCount = foundWorkbooks.length;

    console.log("Workbook Name\tWorkbook UUID");
    console.log("-------------\t-------------");
    for (var i=0; i<workbookCount; i++) {
        console.log(foundWorkbooks[i].workbook + " => " + foundWorkbooks[i].workbookUUID);
    }
}

async function tables() {
    const parameterLogin    = argv.username;
    const parameterPassword = argv.password;
    const parameterWorkbookArn = argv.workbook;

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
        }
    }

    const tableReq = await fetch("https://pod17.dp.us-west-2.honeycode.aws/external/", {
        "headers": {
            "accept": "*/*",
            "content-encoding": "amz-1.0",
            "content-type": "application/json",
            "x-amz-target": "com.amazon.sheets.data.external.SheetsDataService.ListSheets",
            "x-client-id": "clientRegion|BeehiveSDSJSUtils||||",
            "cookie": "bluesky-api-token=" + apitoken,
            "origin": "https://builder.honeycode.aws"
        },
        "body": JSON.stringify({includeSheetDetail: true, workbookArn: parameterWorkbookArn}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    const tableData = await tableReq.json();
    
    var foundTables = [];
    var rowCount = tableData.items.length;
    for (var i=0; i< rowCount; i++) {
        if (tableData.items[i].category == "user") {
            foundTables.push({"table": tableData.items[i].sheetName, "tableUUID": tableData.items[i].sheetArn});
       }
    }

    var tableCount = foundTables.length;

    console.log("Table Name\Table UUID");
    console.log("-------------\t-------------");
    for (var i=0; i<tableCount; i++) {
        console.log(foundTables[i].table + " => " + foundTables[i].tableUUID);
    }
}
if (argv._.includes('workbooks')) {
    workbooks();
}

if (argv._.includes('tables')) {
    tables();
}
