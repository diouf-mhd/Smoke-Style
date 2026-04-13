import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (category) {
        query = query.eq("category", category as "puff" | "chicha" | "bonnet");
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useDeliveryZones = () => {
  return useQuery({
    queryKey: ["delivery_zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delivery_zones").select("*").order("shipping_cost");
      if (error) throw error;
      return data;
    },
  });
};
