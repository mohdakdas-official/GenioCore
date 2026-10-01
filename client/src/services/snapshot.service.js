import api from "./api";

export const uploadSnapshot = async ({ projectId, file }) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    `/projects/${projectId}/snapshots`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
