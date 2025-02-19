require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Models
const Product = mongoose.model('Product', {
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
  category: String,
  stock: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

const Order = mongoose.model('Order', {
  userId: String,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', { 
  userId: String,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,     // 🔍 Added quantity at item level
    name: String,        // 🔍 Added product details
    price: Number,
    imageUrl: String
  }]
});


// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});


// Initialize database
mongoose.connection.once('open', () => {
  console.log('MongoDB connection open and executing seedProducts()');
});

// Product Routes
app.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// 🔍 Updated Cart Routes
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) {
      return res.json({ items: [] }); // 🔍 Return empty cart if none exists
    }
    
    // 🔍 Transform cart data to include necessary product details
    const cartData = {
      items: cart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        imageUrl: item.productId.imageUrl
      }))
    };
    
    res.json(cartData);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.json({ message: 'Error fetching cart', error: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Log the received request body
  console.log('Received request body:', req.body);

  try {
    // Validate inputs
    if (!userId || !productId || !Number.isInteger(quantity) || quantity <= 0) {
      console.log('Validation failed:', { userId, productId, quantity });
      return res.status(400).json({ message: 'Missing required fields or invalid quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Create new cart with proper structure
      cart = new Cart({ 
        userId, 
        items: [{
          productId,
          quantity,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        }] 
      });
    } else {
      // Update existing cart
      const existingItem = cart.items.find(item => 
        item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        });
      }
    }

    await cart.save();
    
    // Populate and return formatted cart data
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    const cartData = {
      items: populatedCart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        imageUrl: item.productId.imageUrl
      }))
    };
    
    res.status(201).json(cartData);
  } catch (error) {
    console.error('Cart save error:', error);
    res.status(500).json({ message: 'Error saving cart', error: error.message });
  }
});

app.delete('/api/cart/:userId/:productId', async (req, res) => { 
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    // Populate and return formatted cart data
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    const cartData = {
      items: populatedCart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        imageUrl: item.productId.imageUrl
      }))
    };

    res.json(cartData);
  } catch (error) {
    console.error('Cart delete error:', error);
    res.status(500).json({ message: 'Error deleting item from cart', error: error.message });
  }
});

app.put('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart or product not found" });
    }

    res.json(cart);
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Failed to update quantity" });
   }
});

// Place Order Route
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;
    
    if (!userId || !items || !totalAmount) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const order = new Order({ userId, items, totalAmount });
    await order.save();

    await Cart.deleteMany({ userId });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    // Validate input
    if (!email || !password) {
      console.log('All fields are required');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User does not exist');
      return res.json({ message: 'User does not exist', flag : "0"});
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid credentials');
      return res.json({ message: 'Invalid credentials', flag: "1" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('User login details saved');

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      flag: "2"
    });
    console.log('Login successful');
  } catch (error) {
    next(error);
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
