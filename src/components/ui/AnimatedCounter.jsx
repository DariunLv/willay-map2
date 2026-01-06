import { useState, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export default function AnimatedCounter({ value, duration = 2 }) {
  const [isInView, setIsInView] = useState(false)
  
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })
  
  const display = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString()
  )

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  return (
    <motion.span
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true, margin: '-100px' }}
    >
      {display}
    </motion.span>
  )
}