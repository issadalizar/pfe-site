import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const { connectDB } = await import('./config/database.js');
await connectDB();
const Order = (await import('./models/Order.js')).default;
const Product = (await import('./models/Product.js')).default;

try {
  console.log('Step 1: Check order item structure');
  const order = await Order.findOne({ paymentStatus: 'paid' });
  console.log('Order item:', JSON.stringify(order.items[0], null, 2));

  console.log('Step 2: Check if productId exists');
  console.log('productId type:', typeof order.items[0].productId);
  console.log('productId value:', order.items[0].productId);

  console.log('Step 3: Manual lookup');
  if (order.items[0].productId) {
    const product = await Product.findById(order.items[0].productId);
    console.log('Manual product lookup result:', !!product);
  } else {
    console.log('productId is falsy, trying lookup by name');
    const product = await Product.findOne({ nom: order.items[0].productName });
    console.log('Lookup by name result:', !!product);
    if (product) {
      console.log('Product found by name:', product.nom);
      console.log('Product categorie:', product.categorie);
    }
  }

} catch (error) {
  console.error('Error:', error);
}
process.exit(0);