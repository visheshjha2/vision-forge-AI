import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wand2, Sparkles, Download, Share2 } from 'lucide-react';

const steps = [
  {
    icon: Wand2,
    title: 'Describe Your Vision',
    description: 'Simply type what you want to create. Our AI understands natural language and artistic concepts.',
    gradient: 'from-gradient-pink to-gradient-purple',
  },
  {
    icon: Sparkles,
    title: 'AI Generates Magic',
    description: 'Our advanced neural networks transform your words into stunning visuals in seconds.',
    gradient: 'from-gradient-purple to-gradient-yellow',
  },
  {
    icon: Download,
    title: 'Refine & Download',
    description: 'Fine-tune your creation with intuitive controls and download in high resolution.',
    gradient: 'from-gradient-yellow to-gradient-peach',
  },
  {
    icon: Share2,
    title: 'Share Your Art',
    description: 'Export your creations and share them with the world. Your vision, amplified.',
    gradient: 'from-gradient-peach to-gradient-pink',
  },
];

export const HowItWorks = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Create in <span className="gradient-text">Four Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to masterpiece in minutes. Our intuitive process makes AI creation accessible to everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="glass-card h-full group hover:scale-[1.02] transition-transform duration-300">
                <div className="text-sm font-bold text-muted-foreground mb-4">
                  0{index + 1}
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
