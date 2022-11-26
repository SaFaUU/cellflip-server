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
        const categoriesCollection = client.db('cellflip').collection('categories');
        const productsCollection = client.db('cellflip').collection('products');
        app.get('/products', async (req, res) => {
            const query = {

            }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })
        app.get('/my-products/:user_mail', async (req, res) => {
            const email = req.params.user_mail;
            const query = {
                sellerMail: email
            }
            console.log(email)
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })
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
        app.post('/add-category', async (req, res) => {
            const category_name = req.query.category_name;
            const category = {
                name: category_name
            }
            const result = await categoriesCollection.insertOne(category)
            res.send(result)
        })
        app.get('/categories', async (req, res) => {
            const query = {

            }
            const result = await categoriesCollection.find(query).toArray()
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