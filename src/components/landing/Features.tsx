import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Image, Wand2, Palette, Layers, Zap, Shield } from 'lucide-react';

const features = [
  { icon: Image, title: 'AI Image Generation', description: 'Create stunning images from text prompts with customizable sizes and styles.', color: 'pink' },
  { icon: Wand2, title: 'AI Image Enhancement', description: 'Upload your images and enhance them with AI-powered editing. Apply styles, fix issues, and transform your photos.', color: 'purple' },
  { icon: Palette, title: 'Style Control', description: 'Choose from various artistic styles and tones to match your creative vision.', color: 'yellow' },
  { icon: Layers, title: 'Project Management', description: 'Organize all your creations in one place with easy access and management.', color: 'peach' },
  { icon: Zap, title: 'Lightning Fast', description: 'Get your creations in seconds with our optimized AI infrastructure.', color: 'pink' },
  { icon: Shield, title: 'Secure & Private', description: 'Your creations are yours. We prioritize your privacy and data security.', color: 'purple' },
];

const colorClasses = {
  pink: 'from-gradient-pink to-gradient-purple',
  purple: 'from-gradient-purple to-gradient-pink',
  yellow: 'from-gradient-yellow to-gradient-peach',
  peach: 'from-gradient-peach to-gradient-yellow',
};

export const Features = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="features" ref={sectionRef} className="py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-gradient-pink/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-gradient-yellow/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Everything You Need to <span className="gradient-text">Create</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for creators of all levels. Unleash your imagination with our comprehensive feature set.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card h-full relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} opacity-5 group-hover:opacity-10 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
