interface WelcomeCardProps {
  onSuggestedMessage?: (message: string) => void;
}

export default function WelcomeCard({ onSuggestedMessage }: WelcomeCardProps) {
  const handleSuggestedClick = (message: string) => {
    if (onSuggestedMessage) {
      onSuggestedMessage(message);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-accent text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome! Ask me about Sam's background
          </h2>
          <p className="text-muted-foreground mb-4">
            I'm an AI assistant trained on Sam's professional experience, skills, and background. 
            Feel free to ask about his cybersecurity expertise, work history, certifications, or any career-related questions.
          </p>
          <div className="flex flex-wrap gap-2">
            <button 
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm hover:bg-secondary/80 transition-colors duration-200"
              onClick={() => handleSuggestedClick('Tell me about your cybersecurity experience')}
              data-testid="button-suggested-experience"
            >
              <i className="fas fa-shield-alt mr-1"></i>
              Cybersecurity Experience
            </button>
            <button 
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm hover:bg-secondary/80 transition-colors duration-200"
              onClick={() => handleSuggestedClick('What certifications do you have?')}
              data-testid="button-suggested-certifications"
            >
              <i className="fas fa-certificate mr-1"></i>
              Certifications
            </button>
            <button 
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm hover:bg-secondary/80 transition-colors duration-200"
              onClick={() => handleSuggestedClick('Tell me about your AI work at Tanium')}
              data-testid="button-suggested-ai"
            >
              <i className="fas fa-brain mr-1"></i>
              AI Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
