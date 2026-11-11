import app from "./app.js";
import http from "http";
import dotenv from "dotenv";
import {connectDB} from "./configs/db.js";
import dns from "node:dns";
import net from "node:net";

// Force Node.js to use IPv4 to fix the Xenova/HuggingFace fetch error
dns.setDefaultResultOrder("ipv4first");  
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}
dotenv.config();
await connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});