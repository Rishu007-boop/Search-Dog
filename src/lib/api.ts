import axios from 'axios';
import type { Dog, SearchResponse } from '../types';
import { dogBreeds } from './mockData';

const api = axios.create({
  baseURL: 'https://frontend-take-home-service.fetch.com',
  withCredentials: true,
});

export const login = async (name: string, email: string) => {
  await api.post('/auth/login', { name, email });
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getBreeds = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>('/dogs/breeds');
  // Add our common breeds to the top of the list
  const commonBreeds = dogBreeds.map(b => b.breed);
  const uniqueBreeds = [...new Set([...commonBreeds, ...data])];
  return uniqueBreeds;
};

export const searchDogs = async (params: {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: number;
  sort?: string;
}): Promise<SearchResponse> => {
  const { data } = await api.get<SearchResponse>('/dogs/search', { params });
  return data;
};

export const getDogs = async (ids: string[]): Promise<Dog[]> => {
  const { data } = await api.post<Dog[]>('/dogs', ids);
  
  // Replace images for common breeds with high-quality Unsplash photos
  return data.map(dog => {
    const breedData = dogBreeds.find(b => b.breed === dog.breed);
    if (breedData) {
      // Randomly select one of the breed's images
      const randomIndex = Math.floor(Math.random() * breedData.images.length);
      return {
        ...dog,
        img: breedData.images[randomIndex]
      };
    }
    return dog;
  });
};

export const matchDog = async (ids: string[]): Promise<{ match: string }> => {
  const { data } = await api.post<{ match: string }>('/dogs/match', ids);
  return data;
};