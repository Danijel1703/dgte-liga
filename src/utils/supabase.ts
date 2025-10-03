import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://blyxxtisqbhihlksqkeb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseXh4dGlzcWJoaWhsa3Nxa2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTg1NzUsImV4cCI6MjA3NDUzNDU3NX0.RF2-QohibEejoF9OwDtk8ntRCHLxeKlnF96zYv13j-Q";

export const supabase = createClient(supabaseUrl!, supabaseKey!);
