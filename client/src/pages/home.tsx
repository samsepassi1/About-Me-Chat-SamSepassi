import Header from "@/components/header";
import WelcomeCard from "@/components/welcome-card";
import ChatInterface from "@/components/chat-interface";
import QuickActions from "@/components/quick-actions";
import ContactModal from "@/components/contact-modal";
import { useState } from "react";

export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="bg-background font-sans min-h-screen">
      <Header onContactClick={() => setIsContactModalOpen(true)} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <WelcomeCard />
        <ChatInterface />
        <QuickActions onContactClick={() => setIsContactModalOpen(true)} />
      </main>

      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Floating Contact Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-200"
          onClick={() => setIsContactModalOpen(true)}
          data-testid="button-contact-mobile"
        >
          <i className="fas fa-envelope"></i>
        </button>
      </div>
    </div>
  );
}
