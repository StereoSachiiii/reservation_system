import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedPageWrapperProps {
    children: ReactNode
    className?: string
}

export default function AnimatedPageWrapper({ children, className = '' }: AnimatedPageWrapperProps) {
    return (
        <motion.div
            className={`h-full w-full flex-1 flex flex-col ${className}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    )
}
