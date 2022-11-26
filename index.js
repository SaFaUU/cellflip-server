const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1cmhy5v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const usersCollection = client.db('cellflip').collection('users');
        app.post('/user', async (req, res) => {
            const user = req.body;
            const query = {
                email: user.email
            }
            const dbUser = await usersCollection.findOne(query);
            console.log(dbUser);
            if (dbUser?.email) {
                res.send({ message: 'User already exists' })
            }
            else {
                const result = await usersCollection.insertOne(user)
                res.send(result)
            }
        })

        app.get('/admin/:email', async (req, res) => {
            const user_email = req.params.email;
            const query = {
                email: user_email
            }
            const user = await usersCollection.findOne(query);
            res.send(user)
        })
        app.get('/user/:email', async (req, res) => {
            const user_email = req.params.email;
            const query = {
                email: user_email
            }
            const user = await usersCollection.findOne(query);
            res.send(user)
        })

        app.get('/users', async (req, res) => {
            const query = {

            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/user', async (req, res) => {
            const role = req.query.role;
            const query = {
                role: role
            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
    }
    catch {

    }
}
run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('CellFlip Server is running')
})

app.listen(port, () => {
    console.log('Cellflip server listening on port ' + port);
});