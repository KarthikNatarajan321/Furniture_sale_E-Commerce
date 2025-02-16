// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// Mock data for products
const mockProducts = [
  {
    _id: '1',
    name: 'Modern Sofa',
    price: 999.99,
    imageUrl: '/api/placeholder/400/300',
    description: 'A comfortable modern sofa perfect for any living room.'
  },
  {
    _id: '2',
    name: 'Dining Table',
    price: 599.99,
    imageUrl: '/api/placeholder/400/300',
    description: 'Elegant dining table that seats 6 people.'
  },
  {
    _id: '3',
    name: 'Bed Frame',
    price: 799.99,
    imageUrl: '/api/placeholder/400/300',
    description: 'Queen size bed frame with headboard.'
  }
];

// Header Component
const Header = () => (
  <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
    <Link to="/" className="text-2xl font-bold">Furniture Store</Link>
    <nav>
      <Link to="/cart" className="mx-2">Cart</Link>
      <Link to="/login" className="mx-2">Login</Link>
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
const Cart = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl mb-4">Your Cart</h1>
    <p>Your cart is currently empty.</p>
    <Link to="/" className="text-blue-500 hover:underline">Go Shopping</Link>
  </div>
);

// Login Page
const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // Simulate successful login
    navigate('/');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register attempt:', { name, email, password });
    // Simulate successful registration
    navigate('/');
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