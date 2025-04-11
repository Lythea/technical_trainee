// lib/supabaseAdminClient.ts
import { createClient } from "@supabase/supabase-js";

// Use the Service Role Key for server-side actions (for security reasons)
const supabaseUrl = "https://ycszkkyuiibkoqbtqlwv.supabase.co"; // From Supabase dashboard
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc3pra3l1aWlia29xYnRxbHd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDI3NDgwMiwiZXhwIjoyMDU5ODUwODAyfQ.FHLPc10c0LYCi2Wpx4m9DS4IfSdZnhq8NVJHiVu_0Uc"; // Your Supabase service role key (ensure it's stored in .env)

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabaseAdmin;
