// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vkylcjrwhasymfjtqgqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWxjanJ3aGFzeW1manRxZ3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDQwODIsImV4cCI6MjA2NjQyMDA4Mn0.JA4rbfSqVuHjUz1z-92jyJjAWLiBlm7S-PFZ7FjM3u0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);