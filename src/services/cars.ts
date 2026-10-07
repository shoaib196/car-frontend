import { type Car } from "@/types";

const API_URL = import.meta.env.VITE_BASE_URL;

if (!API_URL) {
  throw new Error('VITE_BASE_URL is not defined. Please check your .env file.');
}

export const fetchCars = async (): Promise<Car[]> => {
  const response = await fetch(`${API_URL}api/cars/`);

  if (!response.ok) {
    throw new Error('Failed to fetch cars');
  }

  const data = await response.json();
  return data;
};

export const uploadImage = async (file: File, accessToken: string): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}api/cars/image/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const getFullImageUrl = (url?: string): string => {
  if (!url) return '/placeholder-car.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = API_URL || 'http://127.0.0.1:8000/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export const uploadImageToCar = async (carId: string | number, file: File, accessToken: string): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}api/cars/${carId}/image/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image to car: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const deleteImage = async (imageId: string, accessToken: string): Promise<void> => {
  const response = await fetch(`${API_URL}api/cars/image-delete/${imageId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.status} ${response.statusText}`);
  }
};

export const createCar = async (carData: Omit<Car, 'id'>, accessToken: string): Promise<Car> => {
  const response = await fetch(`${API_URL}api/cars/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(carData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create car: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const updateCar = async (carData: Car, accessToken: string): Promise<Car> => {
  const response = await fetch(`${API_URL}api/cars/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(carData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update car: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const deleteCar = async (carId: string, accessToken: string): Promise<void> => {
  const formData = new FormData();
  formData.append('id', carId);

  const response = await fetch(`${API_URL}api/cars/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete car: ${response.status} ${response.statusText}`);
  }
};