import express from "express";
import mongoose from "mongoose";
import surveyRoutes from "./routes/Survey";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Routes
app.use(process.env.ROOT || "", surveyRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

