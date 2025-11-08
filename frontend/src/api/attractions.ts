import { apiClient } from "./client";
import type { Attraction, AttractionResponse } from "../types/attraction";

export async function fetchAttractions(): Promise<Attraction[]> {
  const { data } = await apiClient.get<AttractionResponse>("/api/attractions/");
  return data.data;
}

export async function fetchAttraction(id: string): Promise<Attraction> {
  const { data } = await apiClient.get<Attraction>(`/api/attractions/${id}`);
  return data;
}

export async function upsertAttractions(payload: Attraction[]): Promise<Attraction[]> {
  const { data } = await apiClient.put<AttractionResponse>("/api/attractions/", payload);
  return data.data;
}

export async function deleteAttraction(id: string): Promise<void> {
  await apiClient.delete(`/api/attractions/${id}`);
}

