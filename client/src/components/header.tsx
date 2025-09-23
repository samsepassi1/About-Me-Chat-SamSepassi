interface HeaderProps {
  onContactClick: () => void;
}

export default function Header({ onContactClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xl">
              SS
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-name">
                Sam Sepassi
              </h1>
              <p className="text-muted-foreground" data-testid="text-title">
                AI Interaction Engineer at Tanium
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <i className="fas fa-shield-alt text-accent mr-2"></i>
              Cybersecurity Professional
            </div>
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
              onClick={onContactClick}
              data-testid="button-contact"
            >
              <i className="fas fa-envelope mr-2"></i>
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
