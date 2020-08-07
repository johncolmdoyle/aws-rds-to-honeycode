const { Client } = require('pg')

function get(event, context, callback) {
    console.log("Inside Get");

    let responseCode = 200;

    let id = 0;

    if (event.queryStringParameters && event.queryStringParameters.id) {
        console.log("Received ID: " + event.queryStringParameters.id);
        id = event.queryStringParameters.id;
    }

    const parameterDBUsername = process.env.DB_USERNAME;
    const parameterDBPassword = process.env.DB_PASSWORD;
    const parameterDBHostname = process.env.DB_HOSTNAME;
    const parameterDBDatabase = process.env.DB_DATABASE_NAME;

    const client = new Client({
      user: parameterDBUsername,
      host: parameterDBHostname,
      database: parameterDBDatabase,
      password: parameterDBPassword,
      port: 5432,
    });
    
    client.connect();
    
    const query = {
      // give the query a unique name
      name: 'fetch-sample',
      text: 'SELECT * FROM sample_table WHERE id= $1',
      values: [id],
    }

    
    client.query(query, (err, res) => {

        console.log(err, res);
        let responseBody = res.rows[0];

        let response = {
            statusCode: responseCode,
            body: JSON.stringify(responseBody)
        };

        client.end();

        callback(null, response);
    });
};

function post(event, context, callback) {
    console.log("Inside Post");
    let responseCode = 200;

    let id = 0;

    if (event.httpMethod && event.body && event.httpMethod == "POST") {
        var bodyText = new Buffer(event.body, 'base64').toString('ascii');
        var jsonBody = JSON.parse(bodyText);
        console.log("JSON: " + bodyText);
    }

    const parameterDBUsername = process.env.DB_USERNAME;
    const parameterDBPassword = process.env.DB_PASSWORD;
    const parameterDBHostname = process.env.DB_HOSTNAME;
    const parameterDBDatabase = process.env.DB_DATABASE_NAME;

    const client = new Client({
      user: parameterDBUsername,
      host: parameterDBHostname,
      database: parameterDBDatabase,
      password: parameterDBPassword,
      port: 5432,
    });
    
    client.connect();
    
    const query = {
      // give the query a unique name
      name: 'insert-sample',
      text: 'INSERT INTO sample_table (name, email) VALUES ($1, $2);',
      values: [jsonBody.name, jsonBody.email],
    }

    
    client.query(query, (err, res) => {

        console.log(err, res);
        let responseBody = res.rows[0];

        let response = {
            statusCode: responseCode,
            body: JSON.stringify(responseBody)
        };

        client.end();
        
        console.log("Response: " + JSON.stringify(response));
        callback(null, response);
    });
};

exports.handler = (event, context, callback) => {
    if (event.httpMethod && event.body && event.httpMethod == "POST") {
        post(event, context, callback)
    } else if (event.httpMethod && event.body && event.httpMethod == "GET") {
        get(event, context, callback)
    }
};
