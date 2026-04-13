import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { ShoppingBag, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsAdmin } from "@/hooks/useAdmin";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/puffs", label: "Puffs" },
  { to: "/chichas", label: "Chichas" },
  { to: "/bonnets", label: "Bonnets" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          <span className="text-neon">SMOKE</span>
          <span className="text-foreground"> & </span>
          <span className="text-neon-pink">STYLE</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-display text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/auth" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary">
            Connexion
          </Link>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass"
          >
            <div className="flex flex-col gap-3 p-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`font-display text-base font-medium ${
                    location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/auth" onClick={() => setOpen(false)} className="text-base font-medium text-muted-foreground">
                Connexion
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="text-base font-medium text-accent">
                  Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
