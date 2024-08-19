import React from "react";
import '../Style/Dashboard.css'; // Optional: Use CSS for styling

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <div className="dashboard-body">
        <nav className="dashboard-sidebar">
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#analytics">Analytics</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a href="#profile">Profile</a></li>
            <li><a href="#logout">Logout</a></li>
          </ul>
        </nav>

        <main className="dashboard-content">
          <h2>Welcome to Your Dashboard</h2>
          <p>
            This is the content area. You can customize this section to show
            statistics, charts, or any other information that you need on your dashboard.
          </p>

          <div className="dashboard-widgets">
            <div className="widget">
              <h3>Widget 1</h3>
              <p>Some information about Widget 1.</p>
            </div>

            <div className="widget">
              <h3>Widget 2</h3>
              <p>Some information about Widget 2.</p>
            </div>

            <div className="widget">
              <h3>Widget 3</h3>
              <p>Some information about Widget 3.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
