import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../Style/Dashboard.css'; // Ensure this path matches your project structure
import '../Style/Background.css';
import DashboardAdmin from './DashboardAdmin.jsx';
import RiderDashboard from './DashboardRider.jsx';
import DashboardDriver from './DashboardDriver.jsx';

export default function Dashboard() {
  const [userName, setUserName] = useState('Bato');
  const location = useLocation();
  const user = location.state?.user;
  console.log("This is user from main dashboard");
  const userRole = user["roles"];
  const token = localStorage.getItem('token');
  return (
    <>
    <ul class="background">
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
</ul>
   <div>
     {userRole === 0 && <DashboardAdmin user={user}/>}
     {userRole === 1 && <RiderDashboard user={user}/>}
     {userRole === 2 && <DashboardDriver user={user}/>}
   </div>
   </>
  );
}
