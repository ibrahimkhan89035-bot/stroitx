import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import paymentRoutes from './routes/payment.routes'; // Added Razorpay route import

const startServer = async () => {
  await connectDatabase();

  // Register payment routes before starting the server
  app.use('/api/payments', paymentRoutes);

  app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 StroitX Backend Server Running on Port ${env.PORT}`);
    console.log(`🌐 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API Base URL: ${env.APP_URL}/api`);
    console.log(`=======================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});