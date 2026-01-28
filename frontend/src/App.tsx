import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Landing } from '@/pages/Landing';
import { Signup } from '@/pages/Signup';
import { Login } from '@/pages/Login';
import { InterestSelection } from '@/pages/InterestSelection';
import { RadiusSelection } from '@/pages/RadiusSelection';
import { Profile } from '@/pages/Profile';
import { Feed } from '@/pages/Feed';
import { CreatePost } from '@/pages/CreatePost';
import { PostDetail } from '@/pages/PostDetail';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const AppRoutes: React.FC = () => {
    const { isAuthenticated, _hasHydrated, isNewUser } = useAuthStore();

    // Wait for hydration before rendering routes to prevent flash
    if (!_hasHydrated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                <div className="animate-pulse text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/feed" replace /> : <Landing />}
            />
            <Route
                path="/signup"
                element={
                    isAuthenticated ? (
                        isNewUser ? (
                            <Navigate to="/onboarding/interests" replace />
                        ) : (
                            <Navigate to="/profile" replace />
                        )
                    ) : (
                        <Signup />
                    )
                }
            />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/profile" replace /> : <Login />}
            />

            {/* Protected Onboarding Routes */}
            <Route
                path="/onboarding/interests"
                element={
                    <ProtectedRoute>
                        <InterestSelection />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/onboarding/radius"
                element={
                    <ProtectedRoute>
                        <RadiusSelection />
                    </ProtectedRoute>
                }
            />

            {/* Protected App Routes */}
            <Route
                path="/feed"
                element={
                    <ProtectedRoute>
                        <Feed />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create-post"
                element={
                    <ProtectedRoute>
                        <CreatePost />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/post/:id"
                element={
                    <ProtectedRoute>
                        <PostDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
