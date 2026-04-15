import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import EditPostPage from "./pages/EditPostPage";
import PostPage from "./pages/PostPage";
import CategoriesPage from "./pages/CategoriesPage";
import TagsPage from "./pages/TagsPage";
import DraftsPage from "./pages/DraftsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { AuthProvider, useAuth } from "./components/AuthContext";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <BrowserRouter>
      <NavBar 
        isAuthenticated={isAuthenticated}
        userProfile={user ? {
          name: user.name,
          avatar: undefined // Add avatar support if needed
        } : undefined}
        onLogout={logout}
      />
      <main className="min-h-[calc(100vh-4rem)] container mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/posts/new" 
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute>
                <PostPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/posts/:id/edit" 
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tags"
            element={
              <ProtectedRoute>
                <TagsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/posts/drafts" 
            element={
              <ProtectedRoute>
                <DraftsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;