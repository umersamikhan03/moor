require("dotenv").config(); // Load environment variables

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const compression = require("compression");
const { xss } = require("express-xss-sanitizer");
const mongoSanitize = require("./middlewares/mongoSanitize");

// Routes
const router = require("./routes/api");
const imageMiddleware = require("./middlewares/imageMiddleware");

const app = express();

// ---------------------------
// MongoDB Connection
// ---------------------------
const URL = process.env.MONGO_URI;
if (!URL || !process.env.CLIENT_URL) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

mongoose
  .connect(URL, { autoIndex: true })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// ---------------------------
// CORS Configuration
// ---------------------------
const clientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.replace(/\/$/, ""))
  : [];

const corsOptions = {
  origin: clientUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Favicon"],
};

// ---------------------------
// Security Middlewares
// ---------------------------

// Trust proxy (needed for rate limiting behind proxies)
app.set("trust proxy", 1);

// Enable CORS early so static/uploads also get proper headers
app.use(cors(corsOptions));

// Set secure HTTP headers while allowing cross-origin image resources
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Ensure uploaded files can be used by frontend served from another origin/port
app.use("/uploads", (req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && clientUrl.includes(requestOrigin.replace(/\/$/, ""))) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});


// Apply Sharp middleware BEFORE static serving
app.use("/uploads", imageMiddleware);


// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Compression
app.use(compression());

// Cookie parser
app.use(cookieParser());

// Sanitize MongoDB queries to prevent NoSQL injection
app.use(mongoSanitize);


// Prevent HTTP Parameter Pollution
app.use(hpp());

// Sanitize user input to prevent XSS attacks
app.use(xss());

// ---------------------------
// Body Parsers
// ---------------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ---------------------------
// Rate Limiting
// ---------------------------
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2000, // limit each IP
});
app.use(limiter);

// ---------------------------
// Routes
// ---------------------------
app.use("/api/", router);

module.exports = app;
