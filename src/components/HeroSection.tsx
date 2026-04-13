import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-smoke.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroImage}
        alt="Smoke & Style Vape Shop"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4"
        >
          <span className="text-neon">SMOKE</span>
          <span className="text-foreground"> & </span>
          <span className="text-neon-pink">STYLE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto"
        >
          Puffs, Chichas & Bonnets — Votre style, notre passion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/puffs"
            className="inline-flex items-center justify-center rounded-lg gradient-neon px-8 py-3 font-display font-semibold text-primary-foreground glow-neon transition-transform hover:scale-105"
          >
            Découvrir les Puffs
          </Link>
          <Link
            to="/chichas"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3 font-display font-semibold text-accent-foreground glow-pink transition-transform hover:scale-105"
          >
            Nos Chichas
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
