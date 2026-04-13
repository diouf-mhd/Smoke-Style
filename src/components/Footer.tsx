export const Footer = () => {
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4 text-center space-y-2">
        <p className="font-display text-sm text-muted-foreground">
          <span className="text-neon">SMOKE</span> & <span className="text-neon-pink">STYLE</span> — Tous droits réservés © {new Date().getFullYear()}
        </p>
        <p className="text-xs text-muted-foreground">
          Développé avec expertise par{" "}
          <a
            href="https://moussadioufportfolio.kesug.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Moussa Diouf
          </a>
        </p>
      </div>
    </footer>
  );
};
