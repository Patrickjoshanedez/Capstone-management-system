import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import AdviserDashboard from './pages/AdviserDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-text-center">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-indigo-600 dark:tw-border-indigo-400 tw-mx-auto"></div>
          <p className="tw-mt-4 tw-text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  
  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      student: '/student/dashboard',
      adviser: '/adviser/dashboard',
      coordinator: '/coordinator/dashboard',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/login'} />;
  }
  
  return children;
};

// Redirect to role-based dashboard
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-indigo-600 dark:tw-border-indigo-400"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  
  const dashboardRoutes = {
    student: '/student/dashboard',
    adviser: '/adviser/dashboard',
    coordinator: '/coordinator/dashboard',
  };
  
  return <Navigate to={dashboardRoutes[user.role] || '/login'} />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Dashboard Redirect */}
      <Route path="/dashboard" element={<DashboardRedirect />} />
      
      {/* Student Routes */}
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Adviser Routes */}
      <Route 
        path="/adviser/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['adviser']}>
            <AdviserDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Coordinator Routes */}
      <Route 
        path="/coordinator/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <CoordinatorDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
