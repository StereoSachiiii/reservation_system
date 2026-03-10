import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/shared/api/authApi'
import { useAuth } from '@/shared/context/AuthContext'
import FormField from '@/shared/components/FormField'

/**
 * Admin / Employee Login Page
 * Strictly for internal staff. No registration link.
 */
import { Shield, AlertCircle, ChevronRight, CornerUpLeft } from 'lucide-react'

/**
 * Admin / Employee Login Page
 * Strictly for internal staff. No registration link.
 */
export const EmployeeLoginPage = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({
        username: '',
        password: ''
    })

    const mutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            // Logic fix: Allow only internal staff
            if (data.user.role === 'VENDOR') {
                alert("Access Denied: Vendors must use the public login.");
                return;
            }
            login(data.token, data.user)
            // Redirect based on role
            if (data.user.role === 'ADMIN') navigate('/admin/dashboard')
            else if (data.user.role === 'EMPLOYEE') navigate('/employee')
            else navigate('/home')
        }
    })


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.username || !form.password) {
            return
        }
        const cleaned = {
            username: form.username.trim().toLowerCase(),
            password: form.password.trim()
        }

        mutation.mutate(cleaned)
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800/10">
                <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-900/40">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Staff Portal</h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Authorized Personnel Only</p>
                    </div>
                </div>

                <div className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField
                            label="Internal Username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            placeholder="e.g. j.doe"
                        />

                        <FormField
                            label="Access Password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                        />

                        {mutation.isError && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(mutation.error as any)?.response?.data?.message || 'Authentication Failed'}
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all disabled:opacity-50 active:scale-[0.98] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                        >
                            {mutation.isPending ? "Authenticating..." : (
                                <>
                                    Access System
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <a href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                            <CornerUpLeft size={12} />
                            Vendor Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
