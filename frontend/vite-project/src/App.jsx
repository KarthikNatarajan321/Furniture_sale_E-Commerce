// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock data for products
const mockProducts = [
  {
    _id: '1',
    name: 'Modern Sofa',
    price: 999.99,
    imageUrl: 'https://dukaan.b-cdn.net/700x700/webp/upload_file_service/b9ad04a1-66fd-4bb8-b82c-7521d140a2ad/e6a259e677860331e4474bd616f1fccf.webp',
    description: 'A comfortable modern sofa perfect for any living room.'
  },
  {
    _id: '2',
    name: 'Dining Table',
    price: 599.99,
    imageUrl: 'https://rukminim2.flixcart.com/image/850/1000/k47cgi80/dining-set/f/g/k/8-seater-brown-rosewood-sheesham-hhfk-17-hariom-handicraft-original-imafn66rskcnv96g.jpeg?q=90&crop=false',
    description: 'Elegant dining table that seats 6 people.'
  },
  {
    _id: '3',
    name: 'Bed Frame',
    price: 799.99,
    imageUrl: 'https://www.nilkamalsleep.com/cdn/shop/files/1_61f9365a-c5b3-4b95-a64a-69b40203187c_650x.jpg?v=1724666320',
    description: 'Queen size bed frame with headboard.'
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
];

// Header Component
const Header = () => (
  <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
    <Link to="/" className="text-2xl font-bold">Furniture Store</Link>
    <nav>
      <Link to="/cart" className="mx-2">Cart</Link>
      <Link to="/login" className="mx-2">Login</Link>
      <Link to="/register" className="mx-2">Register</Link>
    </nav>
  </header>
);

// Footer Component
const Footer = () => (
  <footer className="bg-gray-200 text-center p-4 mt-8">
    <p>&copy; {new Date().getFullYear()} Furniture Store. All rights reserved.</p>
  </footer>
);

// Home Page
const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Latest Furniture</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProducts.map((product) => (
          <div key={product._id} className="border rounded shadow p-4">
            <Link to={`/product/${product._id}`}>
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            </Link>
            <h2 className="mt-2 font-bold">{product.name}</h2>
            <p className="mt-1">${product.price}</p>
            <Link to={`/product/${product._id}`} className="text-blue-500 hover:underline mt-2 inline-block">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// Product Details Page
const ProductDetails = () => {
  const { id } = useParams();
  const product = mockProducts.find(p => p._id === id);
  
  if (!product) return <p className="p-4">Product not found</p>;
  
  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-blue-500 hover:underline">Go Back</Link>
      <div className="flex flex-col lg:flex-row mt-4">
        <img src={product.imageUrl} alt={product.name} className="w-full lg:w-1/2 object-cover" />
        <div className="lg:ml-8 mt-4 lg:mt-0">
          <h2 className="text-3xl font-bold">{product.name}</h2>
          <p className="text-xl my-2">${product.price}</p>
          <p>{product.description}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

// Cart Page
const Cart = () => {
  const [cart, setCart] = React.useState([]);
  const userId = localStorage.getItem('userId');

  // 🔹 Fetch User's Cart
  useEffect(() => {
    axios.get(`http://localhost:5000/api/cart/${userId}`)
      .then(response => setCart(response.data.items))
      .catch(error => console.error("Error fetching cart:", error));
  }, []);

  // 🔹 Add Item to Cart
  const addToCart = (product) => {
    axios.post("http://localhost:5000/api/cart", { userId, ...product})
      .then(response => setCart(response.data.items))
      .catch(error => console.error("Error adding to cart:", error));
  };

  // 🔹 Remove Item from Cart
  const removeFromCart = (productId) => {
    axios.delete(`http://localhost:5000/api/cart/${userId}/${productId}`)
      .then(response => setCart(response.data.items))
      .catch(error => console.error("Error removing item:", error));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex justify-between p-4 border rounded">
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p>${item.price} x {item.quantity}</p>
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// Login Page
const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (response.data.flag === "0") {
        console.log('User not found');
        alert('User not found');
      } else if (response.data.flag === "1") {
        alert('Invalid credentials');
      } else {
        localStorage.setItem('token', response.data.token);
        alert('Login successful');
        navigate('/');
      }
      console.log('Login response:', response.data);

    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl mb-4">Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Email</label>
          <input type="email" className="w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label>Password</label>
          <input type="password" className="w-full p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-4">New customer? <Link to="/register" className="text-blue-500 hover:underline">Register</Link></p>
      {/* breadcrumb for successful  */}
      <div class="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md">
        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">Login successful!</span>
      </div>
    </div>
    
  );
};

// Register Page
const Register = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      console.log('Registration response:', response.data);
    navigate('/login');
  } catch (error) {
    console.error('Registration error:', error);
  }
};

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl mb-4">Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Name</label>
          <input type="text" className="w-full p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label>Email</label>
          <input type="email" className="w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label>Password</label>
          <input type="password" className="w-full p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
      <p className="mt-4">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
    </div>
  );
};

// Main App Component
const App = () => (
  <BrowserRouter>
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

export default App;