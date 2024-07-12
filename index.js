require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5500;

app.use(cors({
  origin: ['http://localhost:5173']
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1vlp1px.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const carInfo = client.db('vehicles').collection('cars');
    const carCollection = client.db('vehicles').collection('bookings');


    // ===================== AUTH ==========================
    //AUTH RELATED API

    app.post('/jwt', async (req, res) => {
        const user = req.body;
        console.log(user)
        res.send(user)
    });

    // ======================================================



    app.get('/cars', async (req, res) => {
      const cursor = carInfo.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/cars/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          _id: 1, title: 1, brand: 1, type: 1, price: 1, transmission: 1,
          year: 1, condition: 1, rating: 1, location: 1, mileage: 1, photoLink: 1, description: 1
        }
      };
      const result = await carInfo.findOne(query, options);
      res.send(result);
    });

    app.post('/cars', async(req, res) => {
      const car = req.body;
      console.log('CAR data', car)
      const result = await carInfo.insertOne(car);
      res.send(result);

    });

  
    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      const result = await carCollection.insertOne(booking);
      res.send(result);
    });


    app.get('/bookings', async(req, res) => {
      let query = {};
      if (req.query.brand) {
        query = { brand: req.query.brand };
      }
      const result = await carCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });

    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      const updateDoc = { $set: { status: updateBooking.status } };
      const result = await carCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(`Server is running on port ${port}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});