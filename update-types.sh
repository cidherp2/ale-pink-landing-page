#!/bin/bash

# Read the .env file
env_file=".env.development"

if [ ! -f "$env_file" ]; then
  echo "File $env_file does not exist."
  exit 1
fi

# Search for the AP_SUPABASE_PROJECT variable
supabase_project_id_line=$(grep "^AP_SUPABASE_PROJECT=" "$env_file")

if [ -n "$supabase_project_id_line" ]; then
  # Extract the value after the equals sign
  supabase_project_id=${supabase_project_id_line#AP_SUPABASE_PROJECT=}

  # Run the supabase command
  npx supabase gen types --project-id "$supabase_project_id" > ./src/supabase/Database.ts
  echo "Types generated and saved to /src/supabase/Database.ts"
else
  echo "AP_SUPABASE_PROJECT not found in .env.development file."
fi
