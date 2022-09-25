const express = require('express')
const axios = require('axios')
const cors = require('cors')
const redis = require('redis')
const { json } = require('body-parser')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000
const mongoUri = 'mongodb://127.0.0.1:27017/cs3219-e'
const Data = require('./model/dataModel')

const DEFAULT_EXPIRATION = 300;

// wsl
// redis-server to start
// get key
// flushall

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(cors())

mongoose.connect(mongoUri, { useNewUrlParser: 
    true}).catch(error => console.log("Error connecting to MongoDB: " + error))
    
mongoose.connection.once('open', () => console.log('Connected successfully to MongoDB'))

let redisClient;

(async () => {
    redisClient = redis.createClient();
    
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    
    await redisClient.connect();
    
    await redisClient.set("key", "value");
    console.log("Redis Connected!")
    const value = await redisClient.get("key");
    console.log(value);
})();

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.get('/data', async (req, res) => {
    const start = performance.now()
    const localData = await redisClient.get('datas')

    if (localData !== null) {
        console.log('Cache hit')
        res.json(JSON.parse(localData))
        const end = performance.now()
        console.log(`Execution time: ${end - start} ms`)
    } else {
        console.log('Cache miss')
        Data.get((err, data) => {
            if (err) {
                res.send('Error occurred when retrieving data')
            }
            redisClient.set('datas', JSON.stringify(data))
            res.json(data)
            const end = performance.now()
            console.log(`Execution time: ${end - start} ms`)
        })
    }


    // redisClient.get('datas', async (err, datas) => {
    //     console.log('wtf')
    //     if (err) {
    //         console.log(err)
    //     }
    //     if (datas !== null) {
    //         console.log('Cache hit')
    //         return res.json(JSON.parse(datas))
    //     } else {
    //         console.log('Cache miss')
    //         Data.get((err, data) => {
    //             if (err) {
    //                 res.send("Error occurred when retrieving data")
    //             }
    //             redisClient.set('datas', DEFAULT_EXPIRATION, JSON.stringify(data))
    //             res.json(data)
    //         })
    //     }
    // })
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})
