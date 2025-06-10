import { apiRequest } from "./queryClient";

const getAuthHeaders = () => {
  const token = localStorage.getItem('dataEngineerToken');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const dataEngineerApi = {
  uploadFile: async (formData: FormData) => {
    const response = await fetch('/api/data-engineer/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.json();
  },

  getJobs: async () => {
    const response = await fetch('/api/data-engineer/jobs', {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.json();
  },

  getJob: async (id: number) => {
    const response = await fetch(`/api/data-engineer/jobs/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.json();
  },

  getResults: async () => {
    const response = await fetch('/api/data-engineer/results', {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.json();
  },

  exportJob: async (id: number) => {
    const response = await fetch(`/api/data-engineer/jobs/${id}/export`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.blob();
  },

  exportAllResults: async () => {
    const response = await fetch('/api/data-engineer/export-all', {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    return response.blob();
  },
};
