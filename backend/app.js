import express from 'express';  
import connectDB from './config/db.js';  
import ingredientRoutes from './routes/ingredientRoutes.js';  
import userRoutes from './routes/userRoutes.js';  
import authMiddleware from './middleware/authMiddleware.js';  
import dotenv from 'dotenv';  

const app = express();
dotenv.config();  
connectDB();

app.use(express.json());  
app.use('/api/ingredients', ingredientRoutes); 
app.use('/api/users', userRoutes);  

export default app;
