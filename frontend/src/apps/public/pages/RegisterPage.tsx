import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/shared/api/authApi'
import { useAuth } from '@/shared/context/useAuth'
import type { RegisterRequest } from '@/shared/api/authApi'
import FormField from '@/shared/components/FormField'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import AnimatedPageWrapper from '@/shared/components/AnimatedPageWrapper'

/**
 * Registration Page
 */
function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState<RegisterRequest & { contactNumber: string }>({
        username: '',
        password: '',
        businessName: '',
        email: '',
        contactNumber: '',
        role: 'VENDOR'
    })

    const [errors, setErrors] = useState<Partial<RegisterRequest & { contactNumber?: string }>>({})

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!form.username) newErrors.username = 'Username is required'
        if (!form.password) newErrors.password = 'Password is required'
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (!form.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'

        // Custom fields validation
        if (!form.businessName) newErrors.businessName = 'Business Name is required'
        if (!form.contactNumber) newErrors.contactNumber = 'Contact Number is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const mutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            if (!data?.token) {
                return;
            }
            login(data.token, data.user)
            navigate('/home')
        },
        onError: (err: unknown) => {
            const message = (err && typeof err === 'object' && 'response' in err)
                ? (err as { response: { data?: { message?: string } } }).response?.data?.message
                : (err instanceof Error ? err.message : null);
            setErrors(prev => ({
                ...prev,
                username: message || 'Registration failed'
            }));
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
        const payload: RegisterRequest = {
            username: form.username,
            password: form.password,
            email: form.email,
            role: form.role,
            businessName: form.businessName,
            contactNumber: form.contactNumber,
        }
        if (validate()) {
            mutation.mutate(payload)
        }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
    };

    return (
        <AnimatedPageWrapper className="min-h-screen lg:flex-row bg-white">
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-16 bg-gray-50/50 relative overflow-y-auto max-h-screen no-scrollbar">
                <div className="w-full max-w-md my-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 text-center lg:text-left pt-8"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                        <p className="text-gray-500 mt-2">Start managing your stalls today</p>
                    </motion.div>

                    <motion.form 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        onSubmit={handleSubmit} 
                        className="space-y-4"
                    >
                        {mutation.isError && (
                            <motion.div variants={fadeInUp} className="bg-red-50 border border-red-100 p-3 rounded-xl text-sm text-red-600">
                                {(mutation.error as Error)?.message || "Registration failed. Please try again."}
                            </motion.div>
                        )}

                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                error={errors.username}
                                placeholder="Choose a username"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                error={errors.email}
                                placeholder="name@company.com"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                error={errors.password}
                                placeholder="Create a password"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Business Name"
                                value={form.businessName}
                                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                                error={errors.businessName}
                                placeholder="Your business name"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <FormField
                                label="Contact Number"
                                value={form.contactNumber}
                                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                                error={errors.contactNumber}
                                placeholder="+1 (555) 000-0000"
                            />
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
                                {mutation.isPending ? "Creating..." : "Register"}
                            </motion.button>
                        </motion.div>
                    </motion.form>

                    <div className="space-y-4 mt-4">
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
                                        console.log('Registration Failed');
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
                                <span className="text-sm font-semibold">{googleMutation.error?.message || 'Google Registration failed'}</span>
                            </motion.div>
                        )}

                        <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500 pt-6 pb-8">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-black font-semibold hover:underline"
                            >
                                Login
                            </Link>
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Right side - Visual/Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 blur-[120px]" />
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-violet-500/30 to-fuchsia-500/30 blur-[100px]" />
                </div>
                
                <div className="relative z-10 flex flex-col justify-center p-16 text-white w-full h-full">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-bold mb-6 tracking-tight">
                            Grow Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Audience</span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                            Create an account to reserve premium stalls, manage your profile, and engage with thousands of attendees effortlessly.
                        </p>
                    </motion.div>
                </div>
            </div>
        </AnimatedPageWrapper>
    )
}

export default RegisterPage
