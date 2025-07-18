import { useState } from "react";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { Dashboard } from "@/components/Dashboard";

interface UserPreferences {
  artists: string[];
  genres: string[];
  preferences: {
    duration: string;
    intensity: string;
    format: string;
  };
}

const Index = () => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const handleOnboardingComplete = (data: UserPreferences) => {
    setUserPreferences(data);
    setIsOnboardingComplete(true);
  };

  if (!isOnboardingComplete || !userPreferences) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return <Dashboard userPreferences={userPreferences} />;
};

export default Index;
