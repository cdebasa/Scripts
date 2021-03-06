const mongoose = require('mongoose'); 
const redis = require('redis');
const util = require('util');
const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {


   const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    })); 

//check to see if there is a value for 'key' in redis
const cacheValue = await client.get(key);
//if so return that
if(cacheValue){
    console.log(cacheValue);
    return JSON.parse(cacheValue)
    
}
//Otherwise, issue the query and store the result in redis

    const result = await exec.apply(this, arguments);
    client.set(key, JSON.stringify(result));
    return result;
    
};