import api from "./api";

export const getUserProfile = async () => {
  const response = await api.get("/users/profile");

  return response.data;
};

export const checkUsernameAvailability = async (username) => {
  const response = await api.get("/users/username-availability", {
    params: {
      username,
    },
  });

  return response.data;
};

export const updateUserProfile = async (payload) => {
  const response = await api.patch("/users/profile", payload);

  return response.data;
};

export const changeUserPassword = async (payload) => {
  const response = await api.patch("/users/password", payload);

  return response.data;
};

export const uploadUserAvatar = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Valid avatar file is required.");
  }

  const formData = new FormData();

  formData.append("avatar", file);

  const response = await api.patch("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const removeUserAvatar = async () => {
  const response = await api.delete("/users/avatar");

  return response.data;
};
