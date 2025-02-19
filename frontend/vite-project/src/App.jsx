// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar , SnackbarProvider, enqueueSnackbar} from 'notistack';


// Header Component

const Header = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    enqueueSnackbar("Logged out successfully", { variant: "success" });
    navigate("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-wide">
          Furniture Store
        </Link>

        {/* Mobile menu button */}
        <button
          aria-label="Toggle Menu"
          className="md:hidden focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6 transition-transform transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-4">
          <button
            onClick={() => {
              if (userId) {
                navigate(`/cart/${userId}`);
              } else {
                enqueueSnackbar("Please log in first.", { variant: "error" });
                navigate("/login");
              }
            }}
            className="hover:text-gray-300 transition-colors"
          >
            Cart
          </button>
          {token ? (
            <button onClick={handleLogout} className="hover:text-gray-300 transition-colors">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition-colors">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300 transition-colors">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile navigation */}
<nav className={`md:hidden mt-4 transition-all duration-300 ${isMenuOpen ? "block opacity-100" : "hidden opacity-0"}`}>
  <div className="flex flex-col items-center space-y-3 bg-gray-800 p-4 rounded-lg shadow-lg">
    <button
      onClick={() => {
        if (userId) {
          navigate(`/cart/${userId}`);
          setIsMenuOpen(false);
        } else {
          enqueueSnackbar("Please log in first.", { variant: "error" });
          navigate("/login");
        }
      }}
      className="w-full text-center py-2 text-white hover:text-gray-300 transition-colors"
    >
      🛒 Cart
    </button>
    {token ? (
      <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-center py-2 text-white hover:text-gray-300 transition-colors">
        🚪 Logout
      </button>
    ) : (
      <>
        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 text-white hover:text-gray-300 transition-colors">
          🔑 Login
        </Link>
        <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 text-white hover:text-gray-300 transition-colors">
          ✍️ Register
        </Link>
      </>
    )}
  </div>
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
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl mb-6 font-bold">Latest Furniture</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Products.map((product) => (
          <div key={product._id} className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product._id}`} className="block aspect-w-16 aspect-h-9">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </Link>
            <div className="p-4">
              <h2 className="text-lg md:text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600 mt-1">${product.price}</p>
              <Link 
                to={`/product/${product._id}`} 
                className="mt-3 inline-block text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                View Details
              </Link>
            </div>
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
  const { enqueueSnackbar } = useSnackbar();
  
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
    if (!userId) {
      enqueueSnackbar("Please log in first.", {variant: 'error'});
      return;
    }
    
    axios.post("http://localhost:5000/api/cart", {
      userId,
      productId: fetchedproduct._id,
      quantity: 1
    })
    .then(response => {
      enqueueSnackbar('Added to cart successfully', {variant:'success'});
    })
    .catch(error => {
      enqueueSnackbar('Error adding to cart', {variant:'error'});
    });
  }

  if (!fetchedproduct) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2">
          <img 
            src={fetchedproduct.imageUrl} 
            alt={fetchedproduct.name} 
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{fetchedproduct.name}</h2>
          <p className="text-xl md:text-2xl text-gray-800 mb-4">${fetchedproduct.price}</p>
          <p className="text-gray-600 mb-6">{fetchedproduct.description}</p>
          <button 
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            onClick={addToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
// Cart Page
const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const storedUserId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!storedUserId) {
      setError("Please login to view your cart");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:5000/api/cart/${storedUserId}`)
      .then(response => {
        setCart(response.data || { items: [] });
        setLoading(false);
      })
      .catch(error => {
        setError("Failed to load cart items");
        setLoading(false);
      });
  }, [storedUserId]);

  const removeFromCart = (productId) => {
    if (!storedUserId) {
      enqueueSnackbar("Please log in to remove items from your cart", {variant:'error'});
      return;
    }

    setLoading(true);
    axios.delete(`http://localhost:5000/api/cart/${storedUserId}/${productId}`)
      .then(response => {
        setCart(response.data || { items: [] });
        setLoading(false);
      })
      .catch(error => {
        enqueueSnackbar("Failed to remove item", {variant:'error'});
        setLoading(false);
      });
  };

  const updateCart = (productId, newQuantity) => {
    if (!storedUserId) {
      enqueueSnackbar("Please log in to modify your cart", {variant:'error'});
      return;
    }
  
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
  
    setLoading(true);
    axios.put(`http://localhost:5000/api/cart/${storedUserId}/${productId}`, { quantity: newQuantity })
      .then(response => {
        setCart(response.data || { items: [] });
        setLoading(false);
      })
      .catch(error => {
        enqueueSnackbar("Failed to update quantity", {variant:'error'});
        setLoading(false);
      });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Loading cart...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-6 flex justify-center items-center min-h-screen">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Your Cart</h2>
      
      {(!cart?.items || cart.items.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg shadow-sm">
              <img 
                src={item.imageUrl}  
                className="w-32 h-32 object-cover rounded-lg shadow-md"
                alt={item.name}
              />
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price} x {item.quantity}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => updateCart(item.productId, item.quantity - 1)}
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => updateCart(item.productId, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-8 flex justify-end">
            <button
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
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
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/cart/${userId}`)
      .then(response => setCart(response.data.items))
      .catch(error => console.error("Error fetching cart:", error));
  }, [userId]);

  const handleOrderPlacement = () => {
    axios.post('http://localhost:5000/api/orders', { userId, items: cart, totalAmount, cart })
      .then(() => {
        enqueueSnackbar('Order Placed Successfully!', {variant: 'success'});
        // setCart([]);
        navigate('/');
      })
      .catch(error => console.error("Error placing order:", error));
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="mb-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between border-b py-2">
                <div className="w-1/3 font-medium">{item.name}</div>
                <div className="w-1/3 text-center">{item.quantity} x ${item.price}</div>
                <div className="w-1/3 text-right">
                  ${ (item.quantity * item.price).toFixed(2) }
                </div>
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-lg mb-4">
            Total Amount: ${totalAmount.toFixed(2)}
          </div>
          <div className="text-center">
            <button 
              onClick={handleOrderPlacement} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};
// Login Page
const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (response.data.flag === "0") {
        enqueueSnackbar('User not found', {variant: 'error'});
      } else if (response.data.flag === "1") {
        enqueueSnackbar('Invalid credentials', {variant: 'error'});
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id); // Ensure correct property
        enqueueSnackbar('Login successful', {variant: 'success'});
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
    </div>
  );
};

// Register Page
const Register = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      console.log('Registration response:', response.data);
      enqueueSnackbar('Registration successful', {variant: 'success'});
      navigate('/login');
    } catch (error) {
      enqueueSnackbar('User already exist', {variant: 'warning'});
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
    <SnackbarProvider maxSnack={3}>
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
    </SnackbarProvider>
  </BrowserRouter>
);

export default App;
