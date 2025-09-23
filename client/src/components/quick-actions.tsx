interface QuickActionsProps {
  onContactClick: () => void;
}

export default function QuickActions({ onContactClick }: QuickActionsProps) {
  const handleLinkedInClick = () => {
    window.open('https://linkedin.com/in/samsepassi1', '_blank');
  };

  const handleAskQuestionClick = () => {
    // This could trigger a suggested message in the chat
    const messageInput = document.querySelector('[data-testid="input-message"]') as HTMLTextAreaElement;
    if (messageInput) {
      messageInput.value = 'Can you tell me about your experience with vulnerability management?';
      messageInput.focus();
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={onContactClick}
          data-testid="card-contact"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-envelope text-primary"></i>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Contact Sam</h4>
              <p className="text-sm text-muted-foreground">Get in touch directly</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={handleLinkedInClick}
          data-testid="card-linkedin"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fab fa-linkedin text-primary"></i>
            </div>
            <div>
              <h4 className="font-medium text-foreground">LinkedIn Profile</h4>
              <p className="text-sm text-muted-foreground">View full profile</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={handleAskQuestionClick}
          data-testid="card-ask-question"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <i className="fas fa-question-circle text-accent"></i>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Ask a Question</h4>
              <p className="text-sm text-muted-foreground">Learn more about Sam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
