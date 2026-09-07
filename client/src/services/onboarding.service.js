import api from "./api";

export const completeOnboarding = async (data) => {
  const response = await api.post("/users/onboarding", data);

  return response.data;
};
