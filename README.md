# PUGS-Projekat
A full-stack taxi simulation application demonstrating backend/frontend integration using ASP.NET Core, Service Fabric, and React.

## 🔍 Overview
This project simulates a complete taxi service platform with three distinct user roles (Admin, Rider, and Driver). Built with modern web technologies, it demonstrates microservices architecture using Service Fabric, RESTful API design, and role-based access control. The application includes an estimation service that calculates ride duration, price, and arrival time, providing a comprehensive ride-sharing simulation experience.

## 🧰 Project Structure
API Backend — .NET REST API with Service Fabric microservices architecture
Web Frontend — React app for role-based user interactions
Database — Azure Blob Storage for data persistence
Role System — Admin, Rider, and Driver roles (enum-based)
Clean separation between frontend and backend layers

## 🚀 Getting Started
1. Clone the repository
```bash
git clone https://github.com/Bat0oo/PUGS-Projekat.git
cd PUGS-Projekat
```

2. Set up the backend
```bash
cd backend
dotnet restore
dotnet run
```

3. Set up the frontend
```bash
cd ../frontend
npm install
npm start
```

4. Visit http://localhost:3000

## ✨ Key Features
Three-tier role system: Admin, Rider, and Driver (enum-based roles)
Authentication and user session management
Ride estimation service with duration, price, and arrival time calculations (Currently random)
Role-based access control and authorization
RESTful API with Service Fabric microservices
Ride request and management system
Clean architecture with separated concerns

## 🧩 Tech Stack
Backend: ASP.NET Core, C#, Service Fabric
Frontend: React
Database: Azure Blob Storage
Architecture: Microservices with Service Fabric

## 📂 Use-Cases
Learning microservices architecture with Service Fabric
Understanding role-based access control systems
Full-stack web development with .NET and React
Building ride-sharing or transportation platforms
RESTful API design and implementation
Taxi/ride-hailing service simulation
