import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AtSign, User } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { SignupRequest } from '@/types';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [formData, setFormData] = useState<SignupRequest>({
        email: '',
        password: '',
        alias: '',
        realName: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [signupWithPhone, setSignupWithPhone] = useState(false);

    const signupMutation = useMutation({
        mutationFn: authService.signup,
        onSuccess: (data) => {
            login(data, true);
            navigate('/onboarding/interests');
        },
        onError: (error: any) => {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ general: error.message });
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Basic validation
        if (!formData.email || !formData.password || !formData.alias) {
            setErrors({ general: 'Please fill in all required fields' });
            return;
        }

        signupMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 animate-slide-up">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Account</h1>

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {errors.general}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        icon={<Mail size={20} />}
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Create a password"
                        icon={<Lock size={20} />}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        showPasswordToggle
                        required
                    />

                    <Input
                        label="Alias/Username"
                        type="text"
                        name="alias"
                        placeholder="Enter unique alias"
                        icon={<AtSign size={20} />}
                        value={formData.alias}
                        onChange={handleChange}
                        error={errors.alias}
                        required
                    />

                    <Input
                        label="Real Name (optional)"
                        type="text"
                        name="realName"
                        placeholder="Your full name"
                        icon={<User size={20} />}
                        value={formData.realName}
                        onChange={handleChange}
                    />

                    {/* Phone Signup Toggle */}
                    <div className="flex items-center justify-between py-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={signupWithPhone}
                                onChange={(e) => setSignupWithPhone(e.target.checked)}
                                className="w-5 h-5 accent-primary-purple"
                            />
                            <span className="text-sm">Sign up with phone</span>
                        </label>
                        {signupWithPhone && (
                            <span className="text-xs text-primary-purple">OTP</span>
                        )}
                    </div>

                    {signupWithPhone && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-600 text-sm">
                            Phone signup is available. Contact form will be shown in a future update.
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={signupMutation.isPending}
                    >
                        Continue
                    </Button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have account?{' '}
                    <Link to="/login" className="text-primary-purple font-semibold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};
