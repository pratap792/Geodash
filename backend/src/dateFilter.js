const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let awsConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  endpoint: process.env.ENDPOINT,
};
AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB();

app.get('/uniqueClientIds', async (req, res) => {
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      Limit: 10,
      ProjectionExpression: 'clientId',
    };
    let myPromise = new Promise(async function (Resolve, Reject) {
      let allData = [];
      await documentClient.scan(params, function scanUntilDone(err, data) {
        if (err) {
          console.log(err);
          Reject(res.json({ message: 'Error fetching createdAt attribute' }));
        } else if (data['Items'].length > 0) {
          allData = [...allData, ...data['Items']];

          if (data.LastEvaluatedKey) {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            documentClient.scan(params, scanUntilDone);
          } else {
            console.log(allData.length);
            Resolve(allData);
          }
        }
      });

      myPromise.then((data) => {
        const clientIds = data.map((item) => item.clientId.S);

        const uniqueClientIds = [...new Set(clientIds)];
        console.log(uniqueClientIds);
        res.status(200).json(uniqueClientIds);
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Define the route to fetch the createdAt attribute of all items in the geonamesData table
app.get('/filter', async (req, res) => {
  //const { fd, td } = req.query
  const fd = new Date(req.query.fd);
  const td = new Date(req.query.td);
  const clients = req.query.clients.split(',');
  console.log(clients);
  const params = {
    TableName: process.env.TABLE_NAME,
    Limit: 10,
    ProjectionExpression: 'logId,createdAt,clientId,#query',
    ExpressionAttributeNames: {
      '#query': 'query',
    },
  };

  let myPromise = new Promise(async function (Resolve, Reject) {
    let allData = [];
    await documentClient.scan(params, function scanUntilDone(err, data) {
      if (err) {
        console.log(err);
        Reject(res.json({ message: 'Error fetching createdAt attribute' }));
      } else if (data['Items'].length > 0) {
        allData = [...allData, ...data['Items']];

        if (data.LastEvaluatedKey) {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          documentClient.scan(params, scanUntilDone);
        } else {
          console.log(allData.length);
          Resolve(allData);
        }
      }
    });

    myPromise.then((data) => {
      const resp = data.filter((item) => {
        if (
          new Date(item.createdAt.S).getTime() >= fd.getTime() &&
          new Date(item.createdAt.S).getTime() < td.getTime() &&
          clients.includes(item.clientId.S)
        ) {
          return true;
        } else {
          return false;
        }
      });
      return res.status(201).json(resp);
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port http://localhost:${port}`);
});
