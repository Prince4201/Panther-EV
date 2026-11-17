'use client';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * The Panther "P" mark (a vehicle photo cut into the letter). Company page only: never next to the navbar logo.
 * The artwork is a transparent PNG, so it keeps its own proportions (never stretched) and sits on the page colour.
 */
export function PShapeVisual({ image, alt, className }: { image: string; alt: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={cn('relative', className)}
      initial={reduce ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.22, 0.7, 0.2, 1] }}>
      <Image src={image} alt={alt} width={536} height={465} sizes="(min-width:1024px) 46vw, (min-width:768px) 420px, 92vw" className="h-auto w-full" />
    </motion.div>
  );
}
