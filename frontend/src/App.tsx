import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

// Lazy load pages
const Landing = React.lazy(() => import('@/pages/Landing').then(module => ({ default: module.Landing })));
const Signup = React.lazy(() => import('@/pages/Signup').then(module => ({ default: module.Signup })));
const Login = React.lazy(() => import('@/pages/Login').then(module => ({ default: module.Login })));
const InterestSelection = React.lazy(() => import('@/pages/InterestSelection').then(module => ({ default: module.InterestSelection })));
const RadiusSelection = React.lazy(() => import('@/pages/RadiusSelection').then(module => ({ default: module.RadiusSelection })));
const Profile = React.lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })));
const Settings = React.lazy(() => import('@/pages/Settings').then(module => ({ default: module.Settings })));
const Feed = React.lazy(() => import('@/pages/Feed').then(module => ({ default: module.Feed })));
const CreatePost = React.lazy(() => import('@/pages/CreatePost').then(module => ({ default: module.CreatePost })));
const PostDetail = React.lazy(() => import('@/pages/PostDetail').then(module => ({ default: module.PostDetail })));
const Discover = React.lazy(() => import('@/pages/Discover').then(module => ({ default: module.Discover })));
const Search = React.lazy(() => import('@/pages/Search')); // Default export
const UserProfile = React.lazy(() => import('@/pages/UserProfile').then(module => ({ default: module.UserProfile })));
const Messages = React.lazy(() => import('@/pages/Messages').then(module => ({ default: module.Messages })));
const Chat = React.lazy(() => import('@/pages/Chat').then(module => ({ default: module.Chat })));
const NewChat = React.lazy(() => import('@/pages/NewChat').then(module => ({ default: module.NewChat })));
const Notifications = React.lazy(() => import('@/pages/Notifications')); // Default export
const LaunchDashboard = React.lazy(() => import('@/pages/LaunchDashboard').then(module => ({ default: module.LaunchDashboard })));

import { MainLayout } from '@/components/MainLayout';

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
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-primary-600 text-xl font-semibold">Loading...</div>
            </div>
        }>
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

                {/* Protected Onboarding Routes - No BottomNav */}
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

                {/* Main App Layout with BottomNav */}
                <Route element={<MainLayout />}>
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
                        path="/discover"
                        element={
                            <ProtectedRoute>
                                <Discover />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/huddles"
                        element={
                            <ProtectedRoute>
                                <Feed />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <Search />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/launch"
                        element={
                            <ProtectedRoute>
                                <LaunchDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user/:userId"
                        element={
                            <ProtectedRoute>
                                <UserProfile />
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
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <Messages />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages/:conversationId"
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages/new/:userId"
                        element={
                            <ProtectedRoute>
                                <NewChat />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

import { ToastContainer } from '@/components/Toast';
import { NotificationListener } from '@/components/NotificationListener';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <NotificationListener />
                <ToastContainer />
                <AppRoutes />
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
