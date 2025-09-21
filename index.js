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
      process.env.Frontend_URL,
    ],
    credentials: true,
  })
);
app.use(express.json());

const jwtEmail = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_Access_Token_Secret);
    return decoded.email;
  } catch (error) {
    return null;
  }
};

function generateAccessToken(email) {
  const token = jwt.sign({ email }, process.env.JWT_Access_Token_Secret, {
    expiresIn: "720h",
  });
  return token;
}

app.get("/", (req, res) => {
  res.send("Server Up & Running");
});

async function run() {
  try {
    const userCollection = client.db("thought-scheduler").collection("users");
    const workListCollection = client
      .db("thought-scheduler")
      .collection("workList");

    app.post("/addthought", async (req, res) => {
      try {
        const data = req.body;
        const email = jwtEmail(data.token);
        if (email !== data.data.email) {
          return res.status(403).send({ Access: "Forbidden Access" });
        }
        const result = await workListCollection.insertOne(data.data);

        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error!");
      }
    });

    app.post("/signup", async (req, res) => {
      try {
        const data = req.body;
        const token = generateAccessToken(data.email);
        const existingUser = await userCollection.findOne({
          email: data.email,
        });
        if (existingUser) {
          return res.send({ message: "User already exists", token });
        }
        const result = await userCollection.insertOne(data);
        res.send({ result, token });
      } catch (error) {
        res.status(500).send("Internal Server Error!");
      }
    });

    app.post("/login", async (req, res) => {
      try {
        const data = req.body;
        const user = await userCollection.findOne({ email: data.email });
        if (!user || user.password !== data.password) {
          return res.status(401).send({ message: "Invalid credentials" });
        }
        const token = generateAccessToken(data.email);
        res.send({ message: "Login successful", token });
      } catch (error) {
        res.status(500).send("Internal Server Error!");
      }
    });

    app.get("/mythoughts", async (req, res) => {
      try {
        const email = jwtEmail(req.headers.authorization);
        if (!email) {
          return res.status(403).send({ Access: "Forbidden Access" });
        }
        const query = { email: email };
        const result = await workListCollection.find(query).toArray();
        res.send(result);
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
