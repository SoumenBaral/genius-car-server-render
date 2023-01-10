const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000

//MiddleWore 
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log(decoded, 'decoded');
        req.decoded = decoded;
        next();
    })



   
}

//Connect Mongo 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ga5wb97.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const ServiceCollection = client.db('genius-car').collection('service')
        const OrderCollection = client.db('genius-car').collection('Order')


        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = ServiceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await ServiceCollection.findOne(query);
            res.send(service)
        })

        // Post 

        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await ServiceCollection.insertOne(newService)
            res.send(result)
        })
        //delete
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ServiceCollection.deleteOne(query)
            res.send(result)

        })




        //OderCollection Api
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await OrderCollection.insertOne(order)
            res.send(result)
        })

        //get 
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = OrderCollection.find(query);
                const result = await cursor.toArray()
                res.send(result)
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
        })



        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })
    }
    finally {

    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('I am from Express ')
})
app.listen(port, () => {
    console.log('Cholsay gari Jatrabari ', port);
})