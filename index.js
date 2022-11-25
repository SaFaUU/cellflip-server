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
        app.post('/user', (req, res) => {

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