import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection string
let uri = process.env.DATABASE_URL;
let client, ordersCollection, customersCollection;

async function connectToDatabase() {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const database = client.db("RQ_Analytics"); // Replace with your database name
    ordersCollection = database.collection("shopifyOrders"); // Replace with your collection name
    customersCollection = database.collection("shopifyCustomers"); // Replace with your collection name
    console.log(ordersCollection);
  } catch (e) {
    console.error(e);
  }
}
function checkCollection(res, collection) {
  if (!collection) {
    return res
      .status(503)
      .send("Database is not connected yet. Please try again later.");
  }
}
// Ensure the database connection is established before starting the server
connectToDatabase().catch(console.error);

app.get("/api/customers", async (req, res) => {
  try {
    // Wait until the collection is defined
    console.log("customer collection");
    if (!customersCollection) {
      return res
        .status(503)
        .send("Database is not connected yet. Please try again later.");
    }

    // Perform a query on the customersCollection
    const documents = await customersCollection.find({}).toArray();

    // Send the first document as the response
    res.json(documents[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving data from MongoDB");
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    // Wait until the collection is defined
    console.log("orders collection");
    if (!ordersCollection) {
      return res
        .status(503)
        .send("Database is not connected yet. Please try again later.");
    }

    // Perform a query on the ordersCollection
    const documents = await ordersCollection.find({}).toArray();
    console.log(documents);
    // Send the first document as the response
    res.json(documents[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving data from MongoDB");
  }
});
// Endpoint 1: Total Sales
app.get("/api/total-sales", async (req, res) => {
  if (checkCollection(res, ordersCollection)) return;

  try {
    const totalSales = await ordersCollection
      .aggregate([
        {
          $addFields: {
            created_at_date: { $dateFromString: { dateString: "$created_at" } },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$created_at_date" },
              month: { $month: "$created_at_date" },
              day: { $dayOfMonth: "$created_at_date" },
            },
            totalSales: { $sum: { $toDouble: "$total_price" } },
          },
        },
      ])
      .toArray();

    res.json(totalSales);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving total sales data from MongoDB");
  }
});

// Endpoint 2: Sales Growth Rate Over Time
app.get("/api/sales-growth", async (req, res) => {
  if (checkCollection(res, ordersCollection)) return;

  try {
    const salesGrowth = await ordersCollection
      .aggregate([
        {
          $addFields: {
            created_at_date: { $dateFromString: { dateString: "$created_at" } },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$created_at_date" },
              month: { $month: "$created_at_date" },
            },
            totalSales: { $sum: { $toDouble: "$total_price" } },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray();

    res.json(salesGrowth);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving sales growth data from MongoDB");
  }
});

// Endpoint 3: New Customers Added Over Time
app.get("/api/new-customers", async (req, res) => {
  if (checkCollection(res, customersCollection)) return;

  try {
    const newCustomers = await customersCollection
      .aggregate([
        {
          $addFields: {
            created_at_date: { $dateFromString: { dateString: "$created_at" } },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$created_at_date" },
              month: { $month: "$created_at_date" },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    res.json(newCustomers);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving new customers data from MongoDB");
  }
});

app.get("/api/repeat-customers", async (req, res) => {
  if (checkCollection(res, ordersCollection)) return;

  try {
    const repeatCustomers = await ordersCollection
      .aggregate([
        {
          $addFields: {
            created_at_date: { $dateFromString: { dateString: "$created_at" } },
          },
        },
        {
          $group: {
            _id: {
              customerId: "$customer.id",
              year: { $year: "$created_at_date" },
              month: { $month: "$created_at_date" },
            },
            orderCount: { $sum: 1 },
          },
        },
        {
          $match: { orderCount: { $gt: 1 } }, // Customers with more than one order in the same month/year
        },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: "$_id.month",
            },
            repeatCustomerCount: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }, // Optional: Sort by year and month
        },
      ])
      .toArray();

    res.json(repeatCustomers);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving repeat customers data from MongoDB");
  }
});

// Endpoint 5: Geographical Distribution of Customers
app.get("/api/customer-geography", async (req, res) => {
  if (checkCollection(res, customersCollection)) return;

  try {
    const customerGeography = await customersCollection
      .aggregate([
        {
          $group: {
            _id: "$default_address.city",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    res.json(customerGeography);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send("Error retrieving customer geography data from MongoDB");
  }
});

// Endpoint 6: Customer Lifetime Value by Cohorts
app.get("/api/customer-lifetime-value", async (req, res) => {
  if (checkCollection(res, ordersCollection)) return;

  try {
    const clvByCohort = await ordersCollection
      .aggregate([
        {
          // Add a date field from the `created_at` string
          $addFields: {
            created_at_date: { $dateFromString: { dateString: "$created_at" } },
          },
        },
        {
          // Group by customer ID to find their first purchase
          $group: {
            _id: "$customer.id",
            firstPurchaseDate: { $min: "$created_at_date" },
            totalSpent: { $sum: { $toDouble: "$total_price" } },
          },
        },
        {
          // Extract the year and month from the first purchase date for cohort grouping
          $addFields: {
            cohortYear: { $year: "$firstPurchaseDate" },
            cohortMonth: { $month: "$firstPurchaseDate" },
          },
        },
        {
          // Group by the cohort (year and month of the first purchase)
          $group: {
            _id: {
              year: "$cohortYear",
              month: "$cohortMonth",
            },
            totalCLV: { $sum: "$totalSpent" }, // Sum of all customers' total spend in the cohort
            customerCount: { $sum: 1 }, // Number of customers in this cohort
          },
        },
        {
          // Sort the results by year and month for better visualization
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray();

    res.json(clvByCohort);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send("Error retrieving customer lifetime value data from MongoDB");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
