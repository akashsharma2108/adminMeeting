import { motion } from 'framer-motion'
import { Button } from '../ui/button'

export default function StartStep({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div 
      className="p-8  rounded-lg text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.5 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Hi, admin.
      </motion.h2>
      <motion.p 
        className="mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        We don't see any data. Let's add some data.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button onClick={onComplete}>Start</Button>
      </motion.div>
    </motion.div>
  )
}

