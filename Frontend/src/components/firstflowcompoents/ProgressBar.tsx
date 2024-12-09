import { motion } from 'framer-motion'

interface ProgressBarProps {
  steps: { key: string; label: string }[]
  currentStep: number
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const progress = (currentStep / (steps.length - 1)) * 100

  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: index <= currentStep ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, delay: index * 0.1 }}
              className={`w-4 h-4 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          </div>
        ))}
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <motion.div
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
        />
      </div>
      <div className="flex justify-between text-xs">
        {steps.map((step, index) => (
          <span
            key={step.key}
            className={`${
              index <= currentStep ? 'text-primary font-semibold' : 'text-gray-500'
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}

