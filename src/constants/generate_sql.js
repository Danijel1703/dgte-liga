import fs from 'fs/promises';
import path from 'path';

// The template SQL script structure with the most aggressive user mapping logic.
const sqlTemplate = `
-- 🚨 IMPORTANT PRE-REQUISITES 🚨

-- 1. EXTENSIONS: Ensure the 'uuid-ossp' extension is enabled for gen_random_uuid():
--    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPE: Ensure the custom 'match_status' type exists in your database:
--    CREATE TYPE public.match_status AS ENUM ('waiting', 'completed', 'surrender');

-- 3. EXECUTION: Run the entire script as a single block/transaction.

-- =======================================================================
-- 1. SOURCE DATA CTEs: JSON content embedded here
-- =======================================================================
WITH
groups_json (j) AS (
    SELECT $GROUPS_JSON_CONTENT$::jsonb
),
users_firebase_json (j) AS (
    SELECT $USERS_FIREBASE_JSON_CONTENT$::jsonb
),
users_supabase_json (j) AS (
    SELECT $USERS_SUPABASE_JSON_CONTENT$::jsonb
),

-- =======================================================================
-- 2. USER ID MAPPING: FIX: Use aggressive stripping for maximum match success.
-- Strips all non-alphanumeric characters from the local part of the email.
-- =======================================================================
user_map AS (
    SELECT
        f_user.key AS firebase_user_id,
        s_user ->> 'id' AS supabase_user_id
    FROM
        users_firebase_json u_f,
        users_supabase_json u_s,
        jsonb_each(u_f.j -> 'data') AS f_user(key, value),
        jsonb_array_elements(u_s.j) AS s_user
    WHERE
        -- Aggressive Normalization: 
        -- 1. Get local part of email (before @)
        -- 2. Convert to lowercase
        -- 3. Strip all characters that are NOT a standard letter (a-z) or number (0-9)
        REGEXP_REPLACE(LOWER(REGEXP_REPLACE(f_user.value ->> 'email', '@.*', '', 'g')), '[^a-z0-9]', '', 'g')
        = 
        REGEXP_REPLACE(LOWER(REGEXP_REPLACE(s_user ->> 'email', '@.*', '', 'g')), '[^a-z0-9]', '', 'g')
),

-- 3. EXTRACT GROUPS: Extracts group data and generates new target UUIDs.
group_data AS (
    SELECT
        g.key AS firebase_group_id,
        g.value ->> 'name' AS name,
        g.value ->> 'color' AS color,
        (g.value -> 'createdAt' ->> '__time__')::timestamptz AS created_at,
        g.value -> 'memberIds' AS firebase_member_ids,
        gen_random_uuid() AS new_group_uuid
    FROM
        groups_json gj,
        jsonb_each(gj.j -> 'data') AS g(key, value)
),

-- 4. INSERT Groups into public.group (Confirmed working)
group_insertion AS (
    INSERT INTO public.group (id, name, color, created_at, is_deleted)
    SELECT
        new_group_uuid,
        name,
        color,
        created_at,
        FALSE
    FROM
        group_data
    RETURNING
        id
),

-- 5. GROUP MEMBER INSERTION: Relies on the fixed user_map
group_member_insertion AS (
    INSERT INTO public.group_member (group_id, user_id, is_deleted)
    SELECT
        gd.new_group_uuid,
        um.supabase_user_id::uuid, 
        FALSE
    FROM
        group_data gd
    CROSS JOIN LATERAL
        jsonb_array_elements_text(gd.firebase_member_ids) AS member_id_text(firebase_member_id)
    JOIN
        user_map um ON um.firebase_user_id = member_id_text.firebase_member_id
    RETURNING 1
),

-- 6. EXTRACT MATCHES: Uses CROSS JOIN LATERAL for safe unnesting.
temp_match_data AS (
    SELECT
        gd.new_group_uuid AS group_id,
        (m.value ->> 'playerOneId') AS player_one_firebase_id,
        (m.value ->> 'playerTwoId') AS player_two_firebase_id,
        (m.value ->> 'winnerId') AS winner_firebase_id,
        m.value -> 'sets' AS sets,
        CASE m.value ->> 'status'
            WHEN 'Završen' THEN 'completed'::text
            WHEN 'Čeka' THEN 'waiting'::text
            ELSE 'waiting'::text
        END AS status,
        gd.created_at AS created_at
    FROM
        groups_json gj
    CROSS JOIN LATERAL
        jsonb_each(gj.j -> 'data') AS g(key, value)
    CROSS JOIN LATERAL
        jsonb_each(g.value -> '__collections__' -> 'matches') AS m(match_key, value)
    JOIN
        group_data gd ON gd.firebase_group_id = g.key
)

-- 7. MATCH INSERTION: Relies on the fixed user_map
INSERT INTO public.match (id, group_id, player_one_id, player_two_id, sets, winner_id, status, created_at, is_surrender)
SELECT
    gen_random_uuid(), 
    tmd.group_id,
    p1_map.supabase_user_id::uuid AS player_one_id, 
    p2_map.supabase_user_id::uuid AS player_two_id, 
    tmd.sets,
    CASE WHEN tmd.winner_firebase_id != '' THEN w_map.supabase_user_id::uuid ELSE NULL END AS winner_id,
    tmd.status::match_status,
    tmd.created_at,
    FALSE
FROM
    temp_match_data tmd
JOIN
    user_map p1_map ON p1_map.firebase_user_id = tmd.player_one_firebase_id
JOIN
    user_map p2_map ON p2_map.firebase_user_id = tmd.player_two_firebase_id
LEFT JOIN
    user_map w_map ON w_map.firebase_user_id = tmd.winner_firebase_id
;
-- =======================================================================
-- 8. DEBUGGING QUERIES (UNCOMMENT TO CHECK FOR UNMAPPED USERS)
-- =======================================================================

-- Run these queries *separately* if the inserts fail again.
-- They will show you the Firebase IDs that could not be mapped to a Supabase ID.

-- SELECT 'UNMAPPED_GROUP_MEMBER_ID' AS reason, member_id_text.firebase_member_id AS firebase_id, gd.firebase_group_id AS source_group_id
-- FROM group_data gd
-- CROSS JOIN LATERAL jsonb_array_elements_text(gd.firebase_member_ids) AS member_id_text(firebase_member_id)
-- LEFT JOIN user_map um ON um.firebase_user_id = member_id_text.firebase_member_id
-- WHERE um.supabase_user_id IS NULL;

-- SELECT 'UNMAPPED_MATCH_PLAYER' AS reason, tmd.player_one_firebase_id AS firebase_id, tmd.group_id AS target_group_uuid
-- FROM temp_match_data tmd
-- LEFT JOIN user_map p1_map ON p1_map.firebase_user_id = tmd.player_one_firebase_id
-- WHERE p1_map.supabase_user_id IS NULL

-- UNION ALL

-- SELECT 'UNMAPPED_MATCH_PLAYER' AS reason, tmd.player_two_firebase_id AS firebase_id, tmd.group_id AS target_group_uuid
-- FROM temp_match_data tmd
-- LEFT JOIN user_map p2_map ON p2_map.firebase_user_id = tmd.player_two_firebase_id
-- WHERE p2_map.supabase_user_id IS NULL;
`;

// File names and their corresponding placeholders in the SQL template
const FILE_MAP = {
    '$GROUPS_JSON_CONTENT$': 'groups-firebase.json',
    '$USERS_FIREBASE_JSON_CONTENT$': 'users-firebase.json',
    '$USERS_SUPABASE_JSON_CONTENT$': 'users-supabase.json',
};

const OUTPUT_FILE = 'import_groups_matches_final.sql';

async function getEscapedContent(filePath) {
    try {
        const fullPath = path.resolve(filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        return `'${content.replace(/'/g, "''")}'`;
    } catch (error) {
        console.error(`\n❌ Error reading file ${filePath}. Please ensure the file exists in the current directory.`);
        console.error("Full Error:", error.message);
        process.exit(1);
    }
}

async function main() {
    console.log("Starting SQL file generation with Node.js (ES Module syntax)...");

    let finalSql = sqlTemplate;

    // 1. Read and replace placeholders for each JSON file
    for (const [placeholder, fileName] of Object.entries(FILE_MAP)) {
        console.log(`- Reading ${fileName} and preparing content...`);
        const escapedContent = await getEscapedContent(fileName);
        finalSql = finalSql.replace(placeholder, escapedContent);
    }

    // 2. Write the final SQL file
    try {
        await fs.writeFile(OUTPUT_FILE, finalSql);
        console.log(`\n✅ Success! The complete SQL script has been saved to: ${OUTPUT_FILE}`);
        console.log("Please execute the new 'import_groups_matches_final.sql' against your database.");
    } catch (error) {
        console.error("\n❌ Error writing the output file:", error.message);
        process.exit(1);
    }
}

main();