const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
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
    const data = await documentClient
      .scan({ TableName: tableName, ProjectionExpression: 'clientId' })
      .promise();

    const clientIds = data.Items.map((item) => item.clientId.S);

    const uniqueClientIds = [...new Set(clientIds)];
    res.status(200).json(uniqueClientIds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Unique client IDs API listening at http://localhost:${port}`);
});
