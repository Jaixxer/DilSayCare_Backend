import express from 'express';
import cors from 'cors';
import slotsRouter from './routes/slots';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/slots', slotsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

