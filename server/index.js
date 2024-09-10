import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Emulate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// // MongoDB connection string
// let uri = process.env.DATABASE_URL;
// let client, ordersCollection, customersCollection;

// let dbInitialized = false;

// async function connectToDatabase() {
//   client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   try {
//     await client.connect();
//     console.log("Connected to MongoDB");
//     const database = client.db("RQ_Analytics"); // Replace with your database name
//     ordersCollection = database.collection("shopifyOrders"); // Replace with your collection name
//     customersCollection = database.collection("shopifyCustomers"); // Replace with your collection name
//     dbInitialized = true;
//   } catch (e) {
//     console.error("Failed to connect to MongoDB:", e.message);
//     dbInitialized = false;
//   }
// }
// function checkCollection(res, collection) {
//   if (!collection) {
//     return res
//       .status(503)
//       .send("Database is not connected yet. Please try again later.");
//   }
// }
// // Ensure the database connection is established before starting the server
// // connectToDatabase().catch(console.error);

// // Middleware to check database connection
// app.use((req, res, next) => {
//   if (!dbInitialized) {
//     return res
//       .status(503)
//       .send("Database is not connected yet. Please try again later.");
//   }
//   next();
// });

// app.get("/api/customers", async (req, res) => {
//   try {
//     // Wait until the collection is defined
//     console.log("customer collection");
//     if (!customersCollection) {
//       return res
//         .status(503)
//         .send(`Database is not connected yet. Please try again later.  ${uri}`);
//     }

//     // Perform a query on the customersCollection
//     const documents = await customersCollection.find({}).toArray();

//     // Send the first document as the response
//     res.json(documents[0]);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send(`Error retrieving data from MongoDB ${uri}`);
//   }
// });
// app.get("/api/orders", async (req, res) => {
//   try {
//     // Wait until the collection is defined
//     console.log("orders collection");
//     if (!ordersCollection) {
//       return res
//         .status(503)
//         .send("Database is not connected yet. Please try again later.");
//     }

//     // Perform a query on the ordersCollection
//     const documents = await ordersCollection.find({}).toArray();
//     console.log(documents);
//     // Send the first document as the response
//     res.json(documents[0]);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Error retrieving data from MongoDB");
//   }
// });
// // Endpoint 1: Total Sales
// app.get("/api/total-sales", async (req, res) => {
//   if (checkCollection(res, ordersCollection)) return;

//   try {
//     const totalSales = await ordersCollection
//       .aggregate([
//         {
//           $addFields: {
//             created_at_date: { $dateFromString: { dateString: "$created_at" } },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               year: { $year: "$created_at_date" },
//               month: { $month: "$created_at_date" },
//               day: { $dayOfMonth: "$created_at_date" },
//             },
//             totalSales: { $sum: { $toDouble: "$total_price" } },
//           },
//         },
//       ])
//       .toArray();

//     res.json(totalSales);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Error retrieving total sales data from MongoDB");
//   }
// });

// // Endpoint 2: Sales Growth Rate Over Time
// app.get("/api/sales-growth", async (req, res) => {
//   if (checkCollection(res, ordersCollection)) return;

//   try {
//     const salesGrowth = await ordersCollection
//       .aggregate([
//         {
//           $addFields: {
//             created_at_date: { $dateFromString: { dateString: "$created_at" } },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               year: { $year: "$created_at_date" },
//               month: { $month: "$created_at_date" },
//             },
//             totalSales: { $sum: { $toDouble: "$total_price" } },
//           },
//         },
//         {
//           $sort: { "_id.year": 1, "_id.month": 1 },
//         },
//       ])
//       .toArray();

//     res.json(salesGrowth);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Error retrieving sales growth data from MongoDB");
//   }
// });

// // Endpoint 3: New Customers Added Over Time
// app.get("/api/new-customers", async (req, res) => {
//   if (checkCollection(res, customersCollection)) return;

//   try {
//     const newCustomers = await customersCollection
//       .aggregate([
//         {
//           $addFields: {
//             created_at_date: { $dateFromString: { dateString: "$created_at" } },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               year: { $year: "$created_at_date" },
//               month: { $month: "$created_at_date" },
//             },
//             count: { $sum: 1 },
//           },
//         },
//       ])
//       .toArray();

//     res.json(newCustomers);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Error retrieving new customers data from MongoDB");
//   }
// });

// app.get("/api/repeat-customers", async (req, res) => {
//   if (checkCollection(res, ordersCollection)) return;

//   try {
//     const repeatCustomers = await ordersCollection
//       .aggregate([
//         {
//           $addFields: {
//             created_at_date: { $dateFromString: { dateString: "$created_at" } },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               customerId: "$customer.id",
//               year: { $year: "$created_at_date" },
//               month: { $month: "$created_at_date" },
//             },
//             orderCount: { $sum: 1 },
//           },
//         },
//         {
//           $match: { orderCount: { $gt: 1 } }, // Customers with more than one order in the same month/year
//         },
//         {
//           $group: {
//             _id: {
//               year: "$_id.year",
//               month: "$_id.month",
//             },
//             repeatCustomerCount: { $sum: 1 },
//           },
//         },
//         {
//           $sort: { "_id.year": 1, "_id.month": 1 }, // Optional: Sort by year and month
//         },
//       ])
//       .toArray();

//     res.json(repeatCustomers);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Error retrieving repeat customers data from MongoDB");
//   }
// });

// // Endpoint 5: Geographical Distribution of Customers
// app.get("/api/customer-geography", async (req, res) => {
//   if (checkCollection(res, customersCollection)) return;

//   try {
//     const customerGeography = await customersCollection
//       .aggregate([
//         {
//           $group: {
//             _id: "$default_address.city",
//             count: { $sum: 1 },
//           },
//         },
//       ])
//       .toArray();

//     res.json(customerGeography);
//   } catch (e) {
//     console.error(e);
//     res
//       .status(500)
//       .send("Error retrieving customer geography data from MongoDB");
//   }
// });

// // Endpoint 6: Customer Lifetime Value by Cohorts
// app.get("/api/customer-lifetime-value", async (req, res) => {
//   if (checkCollection(res, ordersCollection)) return;

//   try {
//     const clvByCohort = await ordersCollection
//       .aggregate([
//         {
//           // Add a date field from the `created_at` string
//           $addFields: {
//             created_at_date: { $dateFromString: { dateString: "$created_at" } },
//           },
//         },
//         {
//           // Group by customer ID to find their first purchase
//           $group: {
//             _id: "$customer.id",
//             firstPurchaseDate: { $min: "$created_at_date" },
//             totalSpent: { $sum: { $toDouble: "$total_price" } },
//           },
//         },
//         {
//           // Extract the year and month from the first purchase date for cohort grouping
//           $addFields: {
//             cohortYear: { $year: "$firstPurchaseDate" },
//             cohortMonth: { $month: "$firstPurchaseDate" },
//           },
//         },
//         {
//           // Group by the cohort (year and month of the first purchase)
//           $group: {
//             _id: {
//               year: "$cohortYear",
//               month: "$cohortMonth",
//             },
//             totalCLV: { $sum: "$totalSpent" }, // Sum of all customers' total spend in the cohort
//             customerCount: { $sum: 1 }, // Number of customers in this cohort
//           },
//         },
//         {
//           // Sort the results by year and month for better visualization
//           $sort: { "_id.year": 1, "_id.month": 1 },
//         },
//       ])
//       .toArray();

//     res.json(clvByCohort);
//   } catch (e) {
//     console.error(e);
//     res
//       .status(500)
//       .send("Error retrieving customer lifetime value data from MongoDB");
//   }
// });
//Dummy endpoints
app.get("/api/total-sales", async (req, res) => {
  // Dummy data representing total sales over different days
  const totalSales = [
    { _id: { year: 2023, month: 1, day: 1 }, totalSales: 1500 },
    { _id: { year: 2023, month: 1, day: 15 }, totalSales: 2000 },
    { _id: { year: 2023, month: 2, day: 1 }, totalSales: 1700 },
    { _id: { year: 2023, month: 2, day: 20 }, totalSales: 2200 },
    { _id: { year: 2023, month: 3, day: 5 }, totalSales: 2500 },
    { _id: { year: 2024, month: 1, day: 10 }, totalSales: 2100 },
    { _id: { year: 2024, month: 2, day: 14 }, totalSales: 1900 },
    { _id: { year: 2024, month: 3, day: 8 }, totalSales: 2300 },
    { _id: { year: 2024, month: 4, day: 12 }, totalSales: 2400 },
    { _id: { year: 2025, month: 1, day: 25 }, totalSales: 2600 },
    { _id: { year: 2025, month: 2, day: 20 }, totalSales: 2700 },
    { _id: { year: 2025, month: 3, day: 30 }, totalSales: 2800 },
  ];

  try {
    res.json(totalSales);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error retrieving total sales data");
  }
});

// Endpoint for sales growth data
app.get("/api/sales-growth", (req, res) => {
  const salesGrowthData = [
    { _id: { year: 2023, month: 1 }, totalSales: 1500 },
    { _id: { year: 2023, month: 2 }, totalSales: 2000 },
    { _id: { year: 2023, month: 3 }, totalSales: 1700 },
    { _id: { year: 2023, month: 4 }, totalSales: 2200 },
    { _id: { year: 2023, month: 5 }, totalSales: 2500 },
    { _id: { year: 2023, month: 6 }, totalSales: 2100 },
    { _id: { year: 2023, month: 7 }, totalSales: 1900 },
    { _id: { year: 2023, month: 8 }, totalSales: 2300 },
    { _id: { year: 2023, month: 9 }, totalSales: 2400 },
    { _id: { year: 2023, month: 10 }, totalSales: 2600 },
    { _id: { year: 2023, month: 11 }, totalSales: 2700 },
    { _id: { year: 2023, month: 12 }, totalSales: 2800 },
  ];
  res.json(salesGrowthData);
});

// Endpoint for new customers data
app.get("/api/new-customers", (req, res) => {
  const newCustomersData = [
    { _id: { year: 2023, month: 1 }, count: 10 },
    { _id: { year: 2023, month: 2 }, count: 15 },
    { _id: { year: 2023, month: 3 }, count: 12 },
    { _id: { year: 2023, month: 4 }, count: 20 },
    { _id: { year: 2023, month: 5 }, count: 18 },
    { _id: { year: 2023, month: 6 }, count: 22 },
    { _id: { year: 2023, month: 7 }, count: 17 },
    { _id: { year: 2023, month: 8 }, count: 25 },
    { _id: { year: 2023, month: 9 }, count: 30 },
    { _id: { year: 2023, month: 10 }, count: 28 },
    { _id: { year: 2023, month: 11 }, count: 26 },
    { _id: { year: 2023, month: 12 }, count: 32 },
  ];
  res.json(newCustomersData);
});

// Endpoint for repeat customers data
app.get("/api/repeat-customers", (req, res) => {
  const repeatCustomersData = [
    { _id: { year: 2023, month: 1 }, repeatCustomerCount: 5 },
    { _id: { year: 2023, month: 2 }, repeatCustomerCount: 8 },
    { _id: { year: 2023, month: 3 }, repeatCustomerCount: 6 },
    { _id: { year: 2023, month: 4 }, repeatCustomerCount: 10 },
    { _id: { year: 2023, month: 5 }, repeatCustomerCount: 9 },
    { _id: { year: 2023, month: 6 }, repeatCustomerCount: 11 },
    { _id: { year: 2023, month: 7 }, repeatCustomerCount: 7 },
    { _id: { year: 2023, month: 8 }, repeatCustomerCount: 12 },
    { _id: { year: 2023, month: 9 }, repeatCustomerCount: 14 },
    { _id: { year: 2023, month: 10 }, repeatCustomerCount: 13 },
    { _id: { year: 2023, month: 11 }, repeatCustomerCount: 15 },
    { _id: { year: 2023, month: 12 }, repeatCustomerCount: 16 },
  ];
  res.json(repeatCustomersData);
});

// Endpoint for geographical distribution of customers
app.get("/api/customer-geography", (req, res) => {
  const customerGeographyData = [
    { _id: "New York", count: 50 },
    { _id: "Los Angeles", count: 30 },
    { _id: "Chicago", count: 20 },
    { _id: "Houston", count: 15 },
    { _id: "Phoenix", count: 10 },
  ];
  res.json(customerGeographyData);
});

// Endpoint for customer lifetime value by cohorts
app.get("/api/customer-lifetime-value", (req, res) => {
  const customerLifetimeValueData = [
    { _id: { year: 2023, month: 1 }, totalCLV: 5000, customerCount: 10 },
    { _id: { year: 2023, month: 2 }, totalCLV: 6000, customerCount: 12 },
    { _id: { year: 2023, month: 3 }, totalCLV: 5500, customerCount: 11 },
    { _id: { year: 2023, month: 4 }, totalCLV: 7000, customerCount: 14 },
    { _id: { year: 2023, month: 5 }, totalCLV: 6500, customerCount: 13 },
    { _id: { year: 2023, month: 6 }, totalCLV: 7500, customerCount: 15 },
    { _id: { year: 2023, month: 7 }, totalCLV: 7200, customerCount: 16 },
    { _id: { year: 2023, month: 8 }, totalCLV: 8000, customerCount: 18 },
    { _id: { year: 2023, month: 9 }, totalCLV: 8500, customerCount: 19 },
    { _id: { year: 2023, month: 10 }, totalCLV: 9000, customerCount: 20 },
    { _id: { year: 2023, month: 11 }, totalCLV: 9200, customerCount: 21 },
    { _id: { year: 2023, month: 12 }, totalCLV: 9500, customerCount: 22 },
  ];
  res.json(customerLifetimeValueData);
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, "../dist")));

// Catch-all route to serve index.html for all other routes
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// connectToDatabase()
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//   })
//   .catch((e) => {
//     console.error("Failed to start server:", e.message);
//   });
