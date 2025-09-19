const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Here I connect the Backend with Database

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lm9a1gh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://petconnect0.netlify.app",
      "https://petconnect0aaaa.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const jwtEmail = (token) => {
  try {
    const decoded = jwt.verify(token.token, process.env.Access_Token_Secret);
    return decoded.email;
  } catch (error) {
    return null;
  }
};

const jwtUserId = (token) => {
  try {
    const decoded = jwt.verify(token.token, process.env.Access_Token_Secret);
    return decoded.uid;
  } catch (error) {
    return null;
  }
};

app.get("/", (req, res) => {
  res.send("Server Up & Running");
});

async function run() {
  try {
    const userCollection = client.db("petAdoption").collection("users");
    const workListCollection = client.db("petAdoption").collection("allPets");

    const errorCase = async (apiRoute, cookie, message) => {
      const errorData = {
        userEmail: jwtEmail(cookie),
        userUid: jwtUserId(cookie),
        errorMessage: message,
        time: Date.now(),
        api: apiRoute,
      };
      await apiError.insertOne(errorData);
    };
    const publicErrorCase = async (apiRoute, message) => {
      const errorData = {
        userEmail: anonymous,
        userUid: anonymous,
        errorMessage: message,
        time: Date.now(),
        api: apiRoute,
      };
      await apiError.insertOne(errorData);
    };

    app.get("/getworklist", async (req, res) => {
      try {
        res.send("Tested Successfully");
      } catch (error) {
        res.status(500).send("Internal Server Error!");
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Hit on http://localhost:${port}`);
});
