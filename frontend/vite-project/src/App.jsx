// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


// Header Component
const Header = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  return(
  <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
    <Link to="/" className="text-2xl font-bold">Furniture Store</Link>
    <nav>
    <button
  onClick={() => {
    if (userId) {
      navigate(`/cart/${userId}`);
    } else {
      alert("Please log in first.");
      navigate("/login");
    }
  }}
  className="mx-2"
>
  Cart
</button>
      <Link to="/login" className="mx-2">Login</Link>
      <Link to="/register" className="mx-2">Register</Link>
    </nav>
  </header>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-gray-200 text-center p-4 mt-8">
    <p>&copy; {new Date().getFullYear()} Furniture Store. All rights reserved.</p>
  </footer>
);

// Home Page
const Home = () => {

  const [Products, setProducts] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Latest Furniture</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Products.map((product) => (
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
  const userId = localStorage.getItem('userId');
  const [fetchedproduct, setProduct] = useState(null); 
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProducts();
  }, [id]);

  const addToCart = () => {
    console.log('Adding to cart:', { userId, productId: fetchedproduct._id, quantity: 1 });
    axios.post("http://localhost:5000/api/cart", {
      userId,
      productId: fetchedproduct._id,
      quantity: 1
    })
    .then(response => {
      console.log('Added to cart:', response.data);
      alert('Added to cart successfully');
    })
      .catch(error => console.error("Error adding to cart:", error));
  }

  if (!fetchedproduct) return <p className="p-4">Product not found</p>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-blue-500 hover:underline">Go Back</Link>
      <div className="flex flex-col lg:flex-row mt-4">
        <img src={fetchedproduct.imageUrl} alt={fetchedproduct.name} className="w-full lg:w-1/2 object-cover" />
        <div className="lg:ml-8 mt-4 lg:mt-0">
          <h2 className="text-3xl font-bold">{fetchedproduct.name}</h2>
          <p className="text-xl my-2">${fetchedproduct.price}</p>
          <p>{fetchedproduct.description}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={addToCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

// Cart Page
const Cart = () => {
  const [cart, setCart] = React.useState({ items: [] }); // 🔍 Initialize with proper structure
  const [loading, setLoading] = React.useState(true);    // 🔍 Add loading state
  const [error, setError] = React.useState(null);        // 🔍 Add error state
  const userId = localStorage.getItem('userId');

  // 🔍 Updated cart fetching with proper error handling
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      setError("Please login to view your cart");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:5000/api/cart/${userId}`)
      .then(response => {
        console.log('Fetched cart:', response.data);
        setCart(response.data || { items: [] }); // 🔍 Ensure we always have a valid structure
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching cart:", error);
        setError("Failed to load cart items");
        setLoading(false);
      });
  }, [userId]);

  // 🔍 Updated remove item function with error handling
  const removeFromCart = (productId) => {
    if (!userId || !productId) return;

    setLoading(true);
    axios.delete(`http://localhost:5000/api/cart/${userId}/${productId}`)
      .then(response => {
        setCart(response.data || { items: [] });
        setLoading(false);
      })
      .catch(error => {
        console.error("Error removing item:", error);
        setError("Failed to remove item");
        setLoading(false);
      });
  };

  if (loading) return <div className="p-6">Loading cart...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Your Cart</h2>
      {(!cart?.items || cart.items.length === 0) ? ( // 🔍 Safe access with optional chaining
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cart.items.map((item) => (
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


// Checkout Page
const Checkout = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [cart, setCart] = useState([]);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/cart/${userId}`)
      .then(response => setCart(response.data.items))
      .catch(error => console.error("Error fetching cart:", error));
  }, []);

  const handleOrderPlacement = () => {
    axios.post('http://localhost:5000/api/orders', { userId, items: cart, totalAmount })
      .then(() => {
        alert('Order Placed Successfully!');
        navigate('/');
      })
      .catch(error => console.error("Error placing order:", error));
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold">Checkout</h2>
      <button onClick={handleOrderPlacement} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Place Order</button>
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
        localStorage.setItem('userId', response.data.userId);
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
          <Route path="/cart/:userId" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

export default App;