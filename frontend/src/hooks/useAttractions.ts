import { useQuery } from "@tanstack/react-query";
import { fetchAttractions } from "../api/attractions";

export function useAttractions() {
  return useQuery({
    queryKey: ["attractions"],
    queryFn: fetchAttractions,
    staleTime: 1000 * 60 * 10,
  });
}

