const express = require('express')
const app = express();

// database
const { MongoClient } = require('mongodb');
const ObjectId = require('Mongodb').ObjectId;

// middleware
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(cors());

// port
const port = process.env.PORT || 5000;


// Mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7zq8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// connect Database
async function run() {
    try {

        // Connect the client to the server
        await client.connect();

        // Establish and verify connection
        const database = client.db("tesla");
        // collections
        const userCollection = database.collection("users");
        const carCollection = database.collection("cars");
        const orderCollection = database.collection("orders");


        /**
         * Handle User
         */

        // register users
        app.post('/create-user', async (req, res) => {

            const user = req.body;
            const result = await userCollection.insertOne(user);

            res.json(result);
        })

        // make admin
        app.post('/create-new-admin', async (req, res) => {

            const email = req.body.email;

            const filter = { email: email };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    role: `admin`
                },
            };
            // update document
            const result = await userCollection.updateOne(filter, updateDoc, options);

            res.json(result);
        })

        // check admin
        app.post('/check-admin/:email',async (req,res)=>{

            const currentUser = req.params.email;
            if(currentUser){
                const result = await userCollection.findOne({email: currentUser});
                res.json(result);
            }

        })


        /**
         * handle products
         */

        // add car
        app.post('/add-car', async (req, res) => {

            const car = req.body;
            const result = await carCollection.insertOne(car);

            res.json(result);
        });

        // get car list
        app.get('/car-list/', async (req, res) => {


            // console.log(itemNumber);

            const cursor = carCollection.find({});
            const result = await cursor.toArray();

            res.json(result);
        });

        app.get('/car-list/:num', async (req, res) => {

            const num = parseInt(req.params.num);

            const cursor = carCollection.find({});
            const result = await cursor.limit(num).toArray();

            res.json(result);
        });

        // get car by id
        app.get('/car/:id', async (req, res) => {

            const id = req.params.id;
            const result = await carCollection.findOne({ _id: ObjectId(id) });

            res.json(result);
        });


        /**
         * Manage Orders
         */

        // place order
        app.post('/place-order', async (req, res) => {

            const orderData = req.body;
            const result = await orderCollection.insertOne(orderData);

            res.json(result);
        });

        // get all orders 
        app.get('/all-order/', async (req, res) => {

            const cursor = orderCollection.find({});
            const result = await cursor.toArray();

            res.json(result);
        });
        // get my order by email
        app.get('/my-order/:email', async (req, res) => {

            const userEmail = req.params.email;
            const query = { email: userEmail }

            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();

            res.json(result);
        });

        // delete order
        app.delete('/cancel-order/:id', async (req, res) => {

            const id = req.params.id;
            const result = await orderCollection.deleteOne({ _id: ObjectId(id) })

            res.json(result);
        });






    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.json('carz shop!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})