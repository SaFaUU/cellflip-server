const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1cmhy5v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const usersCollection = client.db('cellflip').collection('users');
        const categoriesCollection = client.db('cellflip').collection('categories');
        const productsCollection = client.db('cellflip').collection('products');
        const bookingsCollection = client.db('cellflip').collection('bookings');
        const paymentDataCollection = client.db('cellflip').collection('paymentData');
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
        });

        app.get('/products', async (req, res) => {
            const query = {
                advertiseEnable: true
            }
            const result = await productsCollection.find(query).limit(6).toArray();
            res.send(result)
        })
        app.get('/my-products/:user_mail', verifyJWT, async (req, res) => {
            const email = req.params.user_mail;
            const query = {
                sellerMail: email
            }
            console.log('Inside /my-products/:user_mail', email)
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })
        app.put('/my-products/:id', verifyJWT, async (req, res) => {
            console.log(req.params.id)
            const id = req.params.id;
            const filter = {
                _id: ObjectId(id)
            }
            const option = { upsert: true }
            const product = req.body;
            const updatedProduct = {
                $set: {
                    advertiseEnable: product.advertiseEnable
                }
            }
            const result = await productsCollection.updateOne(filter, updatedProduct, option);
            res.send(result)
        })
        app.put('/report/:id', async (req, res) => {
            console.log(req.params.id)
            const id = req.params.id;
            const filter = {
                _id: ObjectId(id)
            }
            const option = { upsert: true }
            const updatedProduct = {
                $set: {
                    reported: true
                }
            }
            const result = await productsCollection.updateOne(filter, updatedProduct, option);
            res.send(result)
        })
        app.get('/report', async (req, res) => {
            const query = {
                reported: true
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })
        app.put('/verify/:user_email', async (req, res) => {
            console.log(req.params.user_email)
            const email = req.params.user_email;
            const filter = {
                email: email
            }
            const option = { upsert: true }
            const updatedUser = {
                $set: {
                    verified: true
                }
            }
            const result = await usersCollection.updateOne(filter, updatedUser, option);
            const productFilter = {
                sellerMail: email
            }
            const updatedProducts = {
                $set: {
                    verifiedSeller: true
                }
            }
            const productResult = await productsCollection.updateMany(productFilter, updatedProducts, option);
            res.send(result)
        })
        app.delete('/products/:id', async (req, res) => {
            console.log(req.params.id)
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            }
            const result = await productsCollection.deleteOne(query);
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
        app.post('/payments', verifyJWT, async (req, res) => {
            const paymentData = req.body;
            console.log(paymentData);
            const result = await paymentDataCollection.insertOne(paymentData);

            const option = { upsert: true }
            const bookingFilter = {
                _id: ObjectId(paymentData.bookingId)
            }
            const updatedBookingData = {
                $set: {
                    paid: true
                }
            }
            const bookingResult = await bookingsCollection.updateOne(bookingFilter, updatedBookingData, option);

            const productFilter = {
                _id: ObjectId(paymentData.productId)
            }

            const updatedProductData = {
                $set: {
                    availability: 'sold',
                    advertiseEnable: false,
                }
            }
            const productResult = await productsCollection.updateOne(productFilter, updatedProductData, option);

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
        app.get('/my-orders', verifyJWT, async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = {
                email: email
            }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/bookings', verifyJWT, async (req, res) => {
            const bookingData = req.body;
            console.log(bookingData);
            const result = await bookingsCollection.insertOne(bookingData);
            res.send(result)
        })

        app.get('/booking/:id', verifyJWT, async (req, res) => {
            const bookedProductId = req.params.id;
            console.log(bookedProductId)
            const query = {
                productId: bookedProductId
            }
            const result = await bookingsCollection.findOne(query)
            res.send(result)
        })
        app.post("/create-payment-intent", verifyJWT, async (req, res) => {
            const bookingPriceData = req.body;
            const price = bookingPriceData.price;
            console.log(price)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price,
                currency: "usd",
                "payment_method_types": [
                    "card"],
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.get('/category/:id', async (req, res) => {
            const category_id = req.params.id;
            console.log(category_id)
            const query = {
                category: category_id
            }
            const result = await productsCollection.find(query).toArray()
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