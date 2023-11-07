const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;
require('dotenv').config();




// middleware
app.use(cors(
    {
        origin:[
          'http://localhost:5173'
          
        ],
        credentials: true
      }
));
app.use(express.json());
app.use(cookieParser());


// selfmade middleware
const verifyToken = async(req,res,next) =>{
    const token = req.cookies?.token;
    if(!token){
      return res.status(401).send({message:'unAuthorized'})
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err,decoded) => {
      if(err){
        return  res.status(401).send({message:'unAuthorized'})
      }
  
      console.log('value in token', decoded)
     
      req.user = decoded;
      next();
  
    })
  
  }









const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cuu4rc1.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// const uri = "mongodb+srv://<username>:<password>@cluster0.cuu4rc1.mongodb.net/?retryWrites=true&w=majority";

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });


    //  to generate token using jwt FOR SIGN IN 
  app.post('/jwt',verifyToken, async(req,res) =>{
    const user = req.body;
    console.log(user);
    const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRETE,{expiresIn:'1h'});
    console.log(token)
    res
    .cookie('token', token, {
      httpOnly: true,
      // secure: false,
    //   sameSite: 'none'
    })
    .send({success:true})
    console.log(user)
  })


  // TO CHECK WHICH USER LOGGED OUT

  app.post('/logout', async(req, res) =>{
    const user = req.body;
    console.log('LOGGESD OUT USER')

    // to clear logged users cookie while logging out
     res.clearCookie('token', {maxAge:0}).send({success:true})
})
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res) =>{
    res.send('study buddy server is running')
})

app.listen(port, ()=>{
    console.log(`server is running on ${port}`)
})