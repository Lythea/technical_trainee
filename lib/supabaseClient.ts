// lib/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and anon key
const supabaseUrl = "https://ycszkkyuiibkoqbtqlwv.supabase.co"; // From Supabase dashboard
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc3pra3l1aWlia29xYnRxbHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzQ4MDIsImV4cCI6MjA1OTg1MDgwMn0.KmWwRkAS9_hSlgPjaMQ7gE85ccXOtvKojfqu2a8p234"; // From Supabase dashboard

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
