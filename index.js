const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;
require('dotenv').config();




// middleware
app.use(cors(
  {
    origin: [
      // 'http://localhost:5173',
      
      'https://study-buddy-ce97a.web.app',
      'https://study-buddy-ce97a.firebaseapp.com'
      
    ],
    credentials: true
  }
));
app.use(express.json());
app.use(cookieParser());


// selfmade middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(32, token)
  if (!token) {
    return res.status(401).send({ message: 'unAuthorized' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unAuthorized to' })
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
    const db = client.db('studyBuddy');
    const assignmentCollection = client.db('studyBuddy').collection('assignments')
    const submittedAssignmentCollection = client.db('studyBuddy').collection('submittedAssignments')
    const marksCollection = client.db('studyBuddy').collection('marks')

    


    // to get all assignments in all assignments page
    app.get('/allAssignments', async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const cursor = assignmentCollection.find()
      .skip(page * size)
      .limit(size)
      
      const result = await cursor.toArray();
      res.send(result)
      // res.send(cursor)
    })


        //to get count for all assignment pages
        app.get('/allAssignmentCollection', async(req,res) =>{
          const count = await assignmentCollection.estimatedDocumentCount();
          res.send({count});
    
          
        })

    // to get all submitted assignments in all submitted assignment page
    app.get('/allSubmittedAssignments', async (req, res) => {
      const cursor = submittedAssignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

     
//     // to get all submitted assignments in all submitted assignment page
// app.get('/allSubmittedAssignments', async (req, res) => {
//   const cursor = submittedAssignmentCollection.find({ status: { $ne: 'Completed' } });
 
//   const result = await cursor.toArray();
//   res.send(result);
// });






    // to get assignments by category
    app.get('/assignmentsByCategory', async (req, res) => {
      const category = req.query.category;
      const cursor = assignmentCollection.find({ category: category });
      const result = await cursor.toArray();
      res.send(result);
    });

    


 


// to go to dynamic route
    app.get('/allAssignments/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await assignmentCollection.findOne(query);
      res.send(result)
    });

  
        // to go to a specific assignment update route
        app.get('/update/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await assignmentCollection.findOne(query);
          res.send(result);
      });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });


    //  to generate token using jwt FOR SIGN IN 
    app.post('/jwt', async (req, res) => {
      console.log("hitting the api")
      const user = req.body;
      console.log(150,user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE, { expiresIn: '1h' });
      console.log(152,token)
      res
        .cookie('token', token, {
          httpOnly: true,
          // secure: false,
          //   sameSite: 'none'
        })
        .send({ success: true })
      console.log(user)
    })


    // TO CHECK WHICH USER LOGGED OUT

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('LOGGESD OUT USER')

      // to clear logged users cookie while logging out
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

// for adding assignments

app.post('/assignments', async (req, res) => {
  const newAssignment = req.body;
  console.log(newAssignment)
  const result = await assignmentCollection.insertOne(newAssignment)
  res.send(result);
})



// for adding submitted assignments

app.post('/submittedAssignments', async (req, res) => {
  const newSubmittedAssignment = req.body;
  console.log(newSubmittedAssignment)
  const result = await submittedAssignmentCollection.insertOne(newSubmittedAssignment)
  res.send(result);
})

  //  // to post marks by 
  //  app.post('/marks', async (req, res) => {
  //   const newMark = req.body;
  // // console.log(newSubmittedAssignment)
  // const result = await marksCollection.insertOne(newMark)
  // res.send(result);
  // });

  // to post marks test testtttttt worked
// app.post('/marks', async (req, res) => {
//   const newMark = req.body;
//   const result = await marksCollection.insertOne(newMark);
//   // Update the status of the submitted assignment
//   const query = { title: newMark.title, examineeName: newMark.examineeName };
//   const update = { $set: { status: 'Completed' } };
//   await submittedAssignmentCollection.updateOne(query, update);
//   res.send(result);
// });


// update submitted assignments after submitting marks.




// prvs test for marks 1st try
// app.post('/marks', async (req, res) => {
//   try {
//     const newMark = req.body;
//     console.log('New Mark:', newMark); // Added for debugging

//     const result = await marksCollection.insertOne(newMark);

//     // Update the status of the submitted assignment
//     const query = { title: newMark.title, examineeName: newMark.examineeName };
    
   
//     // console.log('Query:', query);
//     const update = { $set: { status: 'Completed' } };


//     // Testing - Log existing document before the update
//     const existingDocument = await submittedAssignmentCollection.findOne(query);
//     console.log('Existing Document:', existingDocument);

//     const updateResult = await submittedAssignmentCollection.updateOne(query, update);
//     // const updateResult = await submittedAssignmentCollection.updateOne( query,update);

//     // Log the update result for debugging
//     console.log('Update Result:', updateResult);


//     res.send({ result, updateResult });
//   } catch (error) {
//     console.error('An error occurred while updating the status:', error);
//     res.status(500).send({ error: 'An error occurred while updating the status.' });
//   }
// });








    // update assignment
app.put('/update/:id', async(req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const options = {upsert: true};
  const updatedAssignment = req.body;
  const assignment = {

    $set: {

           photo: updatedAssignment.photo,
           title: updatedAssignment.title,
           description: updatedAssignment.description,
           marks: updatedAssignment.marks,
           category: updatedAssignment.category,
           dueDate: updatedAssignment.dueDate
           


    }


  }

  const result = await assignmentCollection.updateOne(query,assignment,options);
  res.send(result)
})


// for updatinga all submitted assignments after giving marks

app.put('/updateMark/:id', async(req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const options = {upsert: true};
  const updatedMark = req.body;
  const assignment = {

    $set: {

      obtainedMarks: updatedMark.obtainedMarks,
      feedback: updatedMark.feedback,
      status: updatedMark.status
           
           


    }


  }

  const result = await submittedAssignmentCollection.updateOne(query,assignment,options);
  res.send(result)
})




// to delete data
app.delete('/allAssignments/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await assignmentCollection.deleteOne(query);
  res.send(result);
});


    //  to make a link for my assignments according to a specific email wala user
    app.get('/myAssignments',verifyToken, async(req, res) =>{
console.log("this is test")
console.log(req.user.email,req.query.userEmail )

        // // checking if the users token match with its actual owner or not
        if(req.query.userEmail !== req.user.email){
          return  res.status(401).send({message:'unAuthorized'})
        }

      let query = {};
      console.log(req.query.userEmail)
      // console.log("userrr",req.user.email)
      
  
      if(req.query?.userEmail){
        query = {userEmail: req.query.userEmail}
      }

      const cursor = await submittedAssignmentCollection.find(query).toArray();
      // const result = await cursor.toArray();
      res.send(cursor);
      // console.log('tokennnn' ,req.cookies.token)
    })

  




    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('study buddy server is running')
})

app.listen(port, () => {
  console.log(`server is running on ${port}`)
})