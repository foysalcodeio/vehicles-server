require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1vlp1px.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Create a db
    const carInfo = client.db('vehicles').collection('cars');
    const carCollection = client.db('vehicles').collection('bookings')

    
    // CODE HERE
    app.get('/cars', async (req, res) => {
      const cursor = carInfo.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/cars/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      //it's used be default - i take specific some data
      const options = {
        projection : {
          _id: 1,
          title: 1,
          brand: 1,
          type: 1,
          price: 1,
          location: 1,
          mileage:1,
          photoLink: 1
        }
      }
      const result = await carInfo.findOne(query, options)
      res.send(result)
    })

    app.post('/cars', async(req, res)=> {
      const car = req.body;
      console.log(car)
      const result = await carInfo.insertOne(car);
      res.send(result);
    })



    // ============================ car booking ============================

    //step-1
    app.post('/bookings', async(req, res)=> {
      const booking = req.body;
      console.log(booking)
      const result = await carCollection.insertOne(booking);
      res.send(result);
    })

    
    //step-2
    app.get('/bookings', async(req, res) => {
      console.log(req.query.brand);
      let query = {};
      //given only specific query taking data
      if(req.query.brand){
        query = {brand: req.query.brand}
      }
      const result = await carCollection.find(query).toArray();
      res.send(result);
    })

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await carCollection.deleteOne(query);
      res.send(result);
    })

    // update & just state change - confirm -> confirmed
    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateBooking = req.body;
      console.log('booking confirm ', updateBooking);

      const updateDoc = {$set:{status:updateBooking.status}}
      const result = await carCollection.updateOne(filter, updateDoc)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(`Server is running on port ${port}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
