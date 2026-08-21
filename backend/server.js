import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { supabase, testConnection } from './lib/supabase.js';
import apiRoutes, { seedTestAccounts, seedQuizQuestions } from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) and any localhost origin
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount API routes
app.use('/api', apiRoutes);

app.get('/api/health', async (req, res) => {
  const connected = await testConnection();
  res.json({
    status: 'online',
    service: 'Learnlytics AI Backend Server (Supabase)',
    database: connected ? 'connected' : 'disconnected',
    provider: 'Supabase PostgreSQL'
  });
});

// Connect to Supabase and seed initial data
async function startServer() {
  console.log('⚡ Connecting to Supabase...');
  const connected = await testConnection();

  if (!connected) {
    console.error('');
    console.error('❌ Could not connect to Supabase.');
    console.error('');
    console.error('   If you see "table does not exist", you need to run the schema SQL first:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/ktvvxizjblmiqtrbgsyc/sql/new');
    console.error('   2. Paste & run the contents of: backend/supabase/schema.sql');
    console.error('');
    console.error('   If you see an auth error, check your SUPABASE_SERVICE_KEY in backend/.env');
    console.error('');
    process.exit(1);
  }

  console.log('⚡ Connected to Supabase (ktvvxizjblmiqtrbgsyc)');

  // Seed quiz questions and test accounts
  await seedQuizQuestions();
  await seedTestAccounts();

  app.listen(PORT, () => {
    console.log(`🚀 Learnlytics AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
