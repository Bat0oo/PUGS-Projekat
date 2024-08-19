import Dashboard from './Components/Dashboard';
import LoginPage from './Components/LoginPage';
import Register from './Components/RegisterPage';
import 'process/browser'; // or require('process/browser');

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <>
        <Router>
            <Routes>
                <Route   path="/" element={<LoginPage />} />
                <Route  path="/Register" element={<Register />} />
                <Route  exact path='/Dashboard' element={<Dashboard/>} ></Route>
            </Routes>
        </Router>
    </>
  );
}

export default App;