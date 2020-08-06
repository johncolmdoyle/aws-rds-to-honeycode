const { Client } = require('pg')

exports.get = (event, context, callback) => {
    let responseCode = 200;
    console.log("Request: " + JSON.stringify(event));

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
        
        console.log("Response: " + JSON.stringify(response));
        callback(null, response);
    });
};
