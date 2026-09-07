import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { completeOnboarding } from "../services/onboarding.service";

const useOnboarding = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

  const updateUser = async (data) => {
    setIsOnboardingLoading(true);
    try {
      const data = await completeOnboarding(data);

      return data;
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  return { updateUser, isOnboardingLoading };
};

export default useOnboarding;
