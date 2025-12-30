import { createClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/Database";



const { VITE_SUPABASE_KEY, VITE_SUPABASE_URL } = import.meta.env
export const supabase = createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_KEY);
