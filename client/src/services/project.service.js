import api from "./api";

export const getProjects = async ({
  status = "ACTIVE",
  limit = 20,
  cursor = null,
} = {}) => {
  const params = {
    status,
    limit,
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await api.get("/projects", {
    params,
  });

  return response.data;
};

export const createProject = async (payload) => {
  const response = await api.post("/projects", payload);

  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);

  return response.data;
};

export const updateProject = async ({ projectId, data }) => {
  const response = await api.patch(`/projects/${projectId}`, data);

  return response.data;
};

export const archiveProject = async (projectId) => {
  const response = await api.patch(`/projects/${projectId}/archive`);

  return response.data;
};

export const restoreProject = async (projectId) => {
  const response = await api.patch(`/projects/${projectId}/restore`);

  return response.data;
};
