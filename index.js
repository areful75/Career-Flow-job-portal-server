const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors=require('cors')
const app = express()
const port =process.env.PORT || 3000;
require('dotenv').config()

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2uae3f8.mongodb.net/?appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection=client.db('Career-Flow-job-portal').collection('jobs');
    const applicationCollection=client.db('Career-Flow-job-portal').collection('application');


    //jobs api
    app.get('/jobs',async(rer,res)=>{
        const cursor=jobCollection.find();//getting data from database
        const result=await cursor.toArray();
        res.send(result);
    })

    app.get('/jobs/:id',async (req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await jobCollection.findOne(query);
        res.send(result);
    })

    //job application related api

    app.post('/application',async (req,res)=>{
        const application=req.body;
        const result=await applicationCollection.insertOne(application);
        res.send(result);
    })

    app.get('/application',async (req,res)=>{
        const email=req.query.email;
        const query={
            applicant:email
        }
        const result=await applicationCollection.find(query).toArray()

        for(const application of result){
            const jobId=application.jobId;
            const job=await jobCollection.findOne({_id: new ObjectId(jobId)});
            application.jobTitle=job.title;
            application.company=job.company;
            application.location=job.location;
            application.company_logo=job.company_logo;
        }
        res.send(result);
    })

    app.delete('/application/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await applicationCollection.deleteOne(query);
        res.send(result);
    });


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
  res.send('carrier flow!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
