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

// Seed initial products if none exist
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const products = [
        {
          name: 'Modern Sofa',
          price: 999.99,
          description: 'A comfortable modern sofa perfect for any living room.',
          imageUrl: 'https://dukaan.b-cdn.net/700x700/webp/upload_file_service/b9ad04a1-66fd-4bb8-b82c-7521d140a2ad/e6a259e677860331e4474bd616f1fccf.webp',
          category: 'Living Room',
          stock: 10
        },
        {
          name: 'Dining Table',
          price: 599.99,
          description: 'Elegant dining table that seats 6 people.',
          imageUrl: 'https://rukminim2.flixcart.com/image/850/1000/k47cgi80/dining-set/f/g/k/8-seater-brown-rosewood-sheesham-hhfk-17-hariom-handicraft-original-imafn66rskcnv96g.jpeg?q=90&crop=false',
          category: 'Dining Room',
          stock: 5
        },
        {
          name: 'Queen Bed Frame',
          price: 799.99,
          description: 'Queen size bed frame with headboard.',
          imageUrl: 'https://www.nilkamalsleep.com/cdn/shop/files/1_61f9365a-c5b3-4b95-a64a-69b40203187c_650x.jpg?v=1724666320',
          category: 'Bedroom',
          stock: 8
        },
      {
        _id: '4',
        name: 'Wooden bench',
        price: 1999.99,
        imageUrl: 'https://images.woodenstreet.de/image/data/benches/cambrey-bench-with-back-rest/revised/honey-finish/updated/new-logo/1.jpg',
        description: 'Comfort cushion bench with sleek design.'
      },
      {
        _id: '5',
        name: 'Sheesham Wooden Table',
        price: 3199.99,
        imageUrl: 'https://thetimberguy.com/cdn/shop/collections/sheesham_wood_furniture_online_suppliers_manufactureres_exporters_from_india_2048x.jpg?v=1565437409',
        description: '4 Seater with a beautiful designed table.'
      },
      {
        _id: '6',
        name: 'Burma Wood Cot',
        price: 4199.99,
        imageUrl: 'https://www.ediy.in/beds/images/burma/Burma-size-001.jpg',
        description: 'Comfort cot where a King size mattress can be used.'
      }
      ];p
      await Product.insertMany(products);
      console.log('Products seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// Initialize database
mongoose.connection.once('open', () => {
  seedProducts();
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
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);

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