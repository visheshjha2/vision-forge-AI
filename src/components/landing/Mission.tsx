import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Heart, Rocket, Users } from 'lucide-react';
import missionImage from '@/assets/mission-image.png';

export const Mission = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section id="mission" ref={sectionRef} className="py-32 relative overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0 gradient-hero" />

      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-gradient-pink/30 to-gradient-purple/30 blur-xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-gradient-yellow/30 to-gradient-peach/30 blur-xl"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full glass text-sm font-medium mb-6">
              Our Mission
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              Democratizing <span className="gradient-text">Creativity</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We believe everyone has a creative vision waiting to be realized. Vision Forge AI removes the technical barriers between imagination and creation, empowering artists, designers, and dreamers to bring their ideas to life.
            </p>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Our mission is to make AI-powered creativity accessible, intuitive, and inspiring. Whether you're a professional artist or just starting your creative journey, we're here to amplify your vision.
            </p>

            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Heart, label: 'Passion' },
                { icon: Rocket, label: 'Innovation' },
                { icon: Users, label: 'Community' },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gradient-pink to-gradient-purple flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <value.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-medium">{value.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden glass-card p-8">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <motion.img
                  src={missionImage}
                  alt="Vision Forge AI"
                  className="w-3/4 h-3/4 object-contain"
                  animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gradient-pink/20 to-gradient-purple/20 blur-3xl -z-10" />
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-gradient-yellow to-gradient-peach shadow-xl glow-yellow"
            />
            <motion.div
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-gradient-purple to-gradient-pink shadow-xl glow-purple"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
