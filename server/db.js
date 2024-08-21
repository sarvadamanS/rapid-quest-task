import { MongoClient } from "mongodb";

// Replace <connection_string> with your actual connection string.
const uri =
  "mongodb+srv://db_user_read:LdmrVA5EDEv4z3Wr@cluster0.n10ox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client, collection;
async function connectToDatabase() {
  // Create a new MongoClient
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");
    const database = client.db("RQ_Analytics"); // Replace with your database name
    collection = database.collection("shopifyCustomers"); // Replace with your collection name
  } catch (e) {
    console.error(e);
  }
}

export { connectToDatabase, client, collection };
