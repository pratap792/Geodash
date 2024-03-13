require('dotenv').config();
const AWS = require('aws-sdk');
const http = require('http');
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  endpoint:process.env.ENDPOINT
}); 

const dynamodb = new AWS.DynamoDB.DocumentClient();


var getall =async()=>{
    var params = {
        TableName: process.env.TABLE_NAME
    }; 
    try {
        const data = await dynamodb.scan(params).promise();
        const server = http.createServer((req,res)=>{
            res.end(JSON.stringify(data, null, 4))
            
            }).listen(3030,'127.0.0.1',()=>{
            console.log("Server is running on port 3000") 
            })
    } catch (error) {
        console.log(error);
    } 
}


getall()






//module.exports = dynamodb;