// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar , SnackbarProvider, enqueueSnackbar} from 'notistack';


// Header Component
const Header = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const { enqueueSnackbar } = useSnackbar();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    enqueueSnackbar("Logged out successfully", { variant: "success" });
    navigate('/login');
  };


  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Furniture Store</Link>
      <nav>
        <button
          onClick={() => {
            if (userId) {
              navigate(`/cart/${userId}`);
            } else {
              enqueueSnackbar("Please log in first.",{variant: 'error'});
              navigate("/login");
            }
          }}
          className="mx-2"
        >
        Cart
        </button>
        {token ? (
          <button onClick={handleLogout} className="mx-2">
            Logout         
           </button>
        ) : (
          <>
            <Link to="/login" className="mx-2">Login</Link>
            <Link to="/register" className="mx-2">Register</Link>
          </>
        )}
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
    console.log('Adding to cart:', { userId, productId: fetchedproduct._id, quantity: 1 });
    axios.post("http://localhost:5000/api/cart", {
      userId,
      productId: fetchedproduct._id,
      quantity: 1
    })
    .then(response => {
      console.log('Added to cart:', response.data);
      enqueueSnackbar('Added to cart successfully',{variant:'success'});
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
  const [cart, setCart] = React.useState({ items: [] }); // Initialize with proper structure
  const [loading, setLoading] = React.useState(true);    // Add loading state
  const [error, setError] = React.useState(null);        // Add error state
  const storedUserId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Updated cart fetching with proper error handling
  useEffect(() => {
    if (!storedUserId) {
      setError("Please login to view your cart");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:5000/api/cart/${storedUserId}`)
      .then(response => {
        console.log('Fetched cart:', response.data);
        setCart(response.data || { items: [] }); // Ensure we always have a valid structure
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching cart:", error);
        setError("Failed to load cart items");
        setLoading(false);
      });
  }, [storedUserId]);

  // Updated remove item function with error handling and guard check for userId
  const removeFromCart = (productId) => {
    if (!storedUserId) {
      enqueueSnackbar("Please log in to remove items from your cart",{variant:'error'});
      return;
    }
    if (!productId) return;

    setLoading(true);
    axios.delete(`http://localhost:5000/api/cart/${storedUserId}/${productId}`)
      .then(response => {
        setCart(response.data || { items: [] });
        setLoading(false);
      })
      .catch(error => {
        console.error("Error removing item:", error);
        enqueueSnackbar("Failed to remove item",{variant:'error'});
        setLoading(false);
      });
  };

  const updateCart = (productId, newQuantity) => {
    if (!storedUserId) {
      enqueueSnackbar("Please log in to modify your cart",{variant:'error'});
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
        console.error("Error updating quantity:", error);
        enqueueSnackbar("Failed to update quantity",{variant:'error'});
        setLoading(false);
      });
  };

  if (loading) return <div className="p-6">Loading cart...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Your Cart</h2>
      {(!cart?.items || cart.items.length === 0) ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mt-4">

            {cart.items.map((item) => (
  <div key={item.productId} className="flex justify-between p-4 border rounded">
      <img src={item.imageUrl}  className="w-20 md:w-32 h-20 md:h-32 object-cover rounded-lg shadow-md"/>
    <div className="flex flex-col justify-center col-span-2">
      <div className="text-xs sm:text-sm md:text-lg font-bold">{item.name}</div>
      <div className="text-[10px] sm:text-xs md:text-base">${item.price} x {item.quantity}</div>
    </div>
    <div className="flex items-center space-x-2 mt-2 md:mt-0">
      <button
        className="px-2 py-1 bg-gray-300 rounded"
        onClick={() => updateCart(item.productId, item.quantity - 1)}
      >
        -
      </button>
      <span className="mx-2">{item.quantity}</span>
      <button
        className="px-2 py-1 bg-gray-300 rounded"
        onClick={() => updateCart(item.productId, item.quantity + 1)}
      >
        +
      </button>
      <button
        className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
        onClick={() => removeFromCart(item.productId)}
      >
        Remove
      </button>
    </div>
  </div>
))}

          </div>
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
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
