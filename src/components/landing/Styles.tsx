import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

import styleRealistic from '@/assets/style-realistic.png';
import styleCinematic from '@/assets/style-cinematic.png';
import styleAbstract from '@/assets/style-abstract.png';
import styleAnime from '@/assets/style-anime.png';
import styleArtistic from '@/assets/style-artistic.png';

const styles = [
  {
    title: 'Realistic',
    description: 'Hyper-detailed, lifelike images with stunning clarity and natural lighting.',
    image: styleRealistic,
    gradient: 'from-gradient-pink to-gradient-purple',
  },
  {
    title: 'Cinematic',
    description: 'Dramatic, movie-quality visuals with epic composition and mood.',
    image: styleCinematic,
    gradient: 'from-gradient-purple to-gradient-yellow',
  },
  {
    title: 'Abstract',
    description: 'Bold, expressive forms with vibrant colors and surreal patterns.',
    image: styleAbstract,
    gradient: 'from-gradient-yellow to-gradient-peach',
  },
  {
    title: 'Anime',
    description: 'Beautiful Japanese animation style with soft tones and expressive detail.',
    image: styleAnime,
    gradient: 'from-gradient-peach to-gradient-pink',
  },
  {
    title: 'Artistic',
    description: 'Fine-art inspired creations with painterly brushstrokes and rich textures.',
    image: styleArtistic,
    gradient: 'from-gradient-orange to-gradient-purple',
  },
];

// Duplicate for seamless loop
const marqueeStyles = [...styles, ...styles];

export const Styles = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="styles" ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-br from-gradient-purple/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-gradient-peach/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm font-medium mb-4">
            Styles
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Generate in Any <span className="gradient-text">Style</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From photorealistic to anime, our AI adapts to your creative vision across diverse artistic styles.
          </p>
        </motion.div>
      </div>

      {/* Marquee row 1 - scrolls left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10"
      >
        <div className="flex gap-6 animate-marquee-left">
          {marqueeStyles.map((style, index) => (
            <StyleCard key={`row1-${index}`} style={style} />
          ))}
        </div>
      </motion.div>

      {/* Marquee row 2 - scrolls right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 mt-6"
      >
        <div className="flex gap-6 animate-marquee-right">
          {[...marqueeStyles].reverse().map((style, index) => (
            <StyleCard key={`row2-${index}`} style={style} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const StyleCard = ({ style }: { style: typeof styles[0] }) => (
  <div className="flex-shrink-0 w-[340px] group cursor-pointer">
    <div className="glass-card overflow-hidden p-0 hover:scale-[1.03] transition-all duration-500">
      <div className="relative h-52 overflow-hidden">
        <img
          src={style.image}
          alt={`${style.title} style example`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2">{style.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{style.description}</p>
      </div>
    </div>
  </div>
);
