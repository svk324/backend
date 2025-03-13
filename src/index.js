// src/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const os = require("os"); // For getting network interfaces
const { PrismaClient } = require("@prisma/client"); // Import Prisma
const itemRoutes = require("./routes/itemRoutes");

// Load environment variables
dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.send("CRUD API is running");
});

// Function to get network interfaces
const getNetworkInfo = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === "IPv4") {
        addresses.push({
          interface: name,
          address: iface.address,
        });
      }
    }
  }

  return addresses;
};

// Test database connection and start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection established successfully");
    console.log(
      `📊 Connected to database: ${
        process.env.DATABASE_URL.split("@")[1].split("/")[1]
      }`
    );

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);

      // Display network information
      const networkInfo = getNetworkInfo();

      if (networkInfo.length > 0) {
        console.log("📡 Server accessible at:");
        networkInfo.forEach((info) => {
          console.log(`   http://${info.address}:${PORT} (${info.interface})`);
        });
      } else {
        console.log("📡 No external network interfaces found");
      }

      console.log("🔗 Local access: http://localhost:" + PORT);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:");
    console.error(error);
    process.exit(1);
  } finally {
    // Disconnect Prisma when process is terminated
    process.on("SIGINT", async () => {
      await prisma.$disconnect();
      console.log("Database connection closed");
      process.exit(0);
    });
  }
}

// Run the server
startServer();
