import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

import styleRealistic from '@/assets/style-realistic.png';
import styleCinematic from '@/assets/style-cinematic.png';
import styleAbstract from '@/assets/style-abstract.png';
import styleAnime from '@/assets/style-anime.png';
import styleArtistic from '@/assets/style-artistic.png';

const styles = [
  {
    title: 'Realistic',
    description: 'Hyper-detailed, lifelike images with stunning clarity and natural lighting that blur the line between AI and photography.',
    image: styleRealistic,
    gradient: 'from-gradient-pink to-gradient-purple',
  },
  {
    title: 'Cinematic',
    description: 'Dramatic, movie-quality visuals with epic composition, volumetric lighting, and powerful mood.',
    image: styleCinematic,
    gradient: 'from-gradient-purple to-gradient-yellow',
  },
  {
    title: 'Abstract',
    description: 'Bold, expressive forms with vibrant colors and surreal patterns that push creative boundaries.',
    image: styleAbstract,
    gradient: 'from-gradient-yellow to-gradient-peach',
  },
  {
    title: 'Anime',
    description: 'Beautiful Japanese animation style with soft tones, expressive characters, and enchanting detail.',
    image: styleAnime,
    gradient: 'from-gradient-peach to-gradient-pink',
  },
  {
    title: 'Artistic',
    description: 'Fine-art inspired creations with painterly brushstrokes, rich textures, and timeless beauty.',
    image: styleArtistic,
    gradient: 'from-gradient-orange to-gradient-purple',
  },
];

export const Styles = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % styles.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="styles" ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-br from-gradient-purple/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-gradient-peach/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
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

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Stacked card area */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-md aspect-[3/4] flex-shrink-0"
          >
            {/* Background stacked cards */}
            {styles.map((style, index) => {
              const offset = ((index - active + styles.length) % styles.length);
              const isVisible = offset <= 2;
              if (!isVisible) return null;

              return (
                <motion.div
                  key={style.title}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                  style={{ originX: 0.5, originY: 1 }}
                  animate={{
                    scale: 1 - offset * 0.06,
                    y: -offset * 18,
                    rotateZ: offset * 2.5,
                    opacity: offset === 0 ? 1 : 0.7 - offset * 0.2,
                    zIndex: styles.length - offset,
                  }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  onClick={() => setActive(index)}
                >
                  <img
                    src={style.image}
                    alt={`${style.title} style`}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent`} />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-primary-foreground mb-1">{style.title}</h3>
                    <p className="text-sm text-primary-foreground/80 line-clamp-2">{style.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right side — active style info + selector dots */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 text-center lg:text-left"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${styles[active].gradient} text-primary-foreground`}>
                  {styles[active].title}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  {styles[active].title} Style
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {styles[active].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="flex gap-3 mt-8 justify-center lg:justify-start">
              {styles.map((style, index) => (
                <button
                  key={style.title}
                  onClick={() => setActive(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === active
                      ? 'bg-primary scale-125 shadow-lg'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`View ${style.title} style`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
