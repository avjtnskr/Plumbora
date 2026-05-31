import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import CustomerProfile from './pages/CustomerProfile';
import Services from './pages/Services';
import Plumbers from './pages/Plumbers'
import Contact from './pages/Contact';
import BookPlumber from './pages/BookPlumber';
import TrackBooking from './pages/TrackBooking';
import AdminPanel from './pages/AdminPanel';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/about"    element={<AboutUs />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/Plumbers" element={<Plumbers/>}/>
          <Route path="/contact"  element={<Contact />} />
          <Route path="/book" element={<BookPlumber />} />
          <Route path="/track" element={<TrackBooking />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
