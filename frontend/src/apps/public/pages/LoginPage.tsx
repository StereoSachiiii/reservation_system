import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/shared/api/authApi'
import { useAuth } from '@/shared/context/AuthContext'
import type { LoginRequest } from '@/shared/api/authApi'
import FormField from '@/shared/components/FormField'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import AnimatedPageWrapper from '@/shared/components/AnimatedPageWrapper'

/**
 * Login Page
 */
function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState<LoginRequest>({
        username: '',
        password: '',
    })
    const [errors, setErrors] = useState<Partial<LoginRequest>>({})

    const validate = () => {
        const newErrors: Partial<LoginRequest> = {}
        if (!form.username) newErrors.username = 'Username is required'
        if (!form.password) newErrors.password = 'Password is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const mutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            login(data.token, data.user);
            if (data.user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (data.user.role === 'EMPLOYEE') {
                navigate('/employee');
            } else {
                navigate('/vendor/dashboard');
            }
        }
    })

    const googleMutation = useMutation({
        mutationFn: authApi.googleLogin,
        onSuccess: (data) => {
            login(data.token, data.user);
            if (data.user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (data.user.role === 'EMPLOYEE') {
                navigate('/employee');
            } else {
                navigate('/vendor/dashboard');
            }
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validate()) {
            mutation.mutate(form)
        }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
    };

    return (
        <AnimatedPageWrapper className="min-h-screen flex bg-white">
            {/* Left side - Visual/Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 blur-[120px]" />
                </div>
                
                <div className="relative z-10 flex flex-col justify-center p-16 text-white w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-bold mb-6 tracking-tight">
                            Discover the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Future</span> of Fairs
                        </h1>
                        <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                            Join thousands of vendors and visitors in the most seamlessly managed fair experience. Elevate your business today.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-gray-50/50 relative">
                <div className="w-full max-w-md">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10 text-center lg:text-left"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Sign in to manage your stall reservations</p>
                    </motion.div>

                    <motion.form 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        onSubmit={handleSubmit} 
                        className="space-y-5"
                    >
                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                error={errors.username}
                                placeholder="Enter your username"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                error={errors.password}
                                placeholder="Enter your password"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex justify-end pt-1">
                            <Link to="/forgot-password" title="Forgot Password" className="text-sm font-semibold text-gray-500 hover:text-black transition">
                                Forgot Password?
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.01, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full bg-black text-white font-medium py-3.5 rounded-xl 
                                         hover:bg-gray-800 transition-all duration-200 
                                         disabled:opacity-50 shadow-lg shadow-black/10"
                            >
                                {mutation.isPending ? "Signing in..." : "Login"}
                            </motion.button>
                        </motion.div>

                        {mutation.isError && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600"
                            >
                                <div className="bg-red-100 p-1.5 rounded-full">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold">{mutation.error?.message || 'Login failed'}</span>
                            </motion.div>
                        )}
                    </motion.form>

                    <div className="space-y-5 mt-5">
                        <motion.div variants={fadeInUp} className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50/50 text-gray-500 font-medium">Or continue with</span>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex justify-center" whileHover={{ scale: 1.02 }}>
                            <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200">
                                <GoogleLogin
                                    onSuccess={credentialResponse => {
                                        if (credentialResponse.credential) {
                                            googleMutation.mutate(credentialResponse.credential);
                                        }
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                    useOneTap
                                />
                            </div>
                        </motion.div>

                        {googleMutation.isError && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 mt-4"
                            >
                                <div className="bg-red-100 p-1.5 rounded-full">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold">{googleMutation.error?.message || 'Google Login failed'}</span>
                            </motion.div>
                        )}

                        <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500 pt-6">
                            Don't have an account?{" "}
                            <Link
                                to="/"
                                className="text-black font-semibold hover:underline"
                            >
                                Register
                            </Link>
                        </motion.p>
                    </div>
                </div>
            </div>
        </AnimatedPageWrapper>
    )
}

export default LoginPage
