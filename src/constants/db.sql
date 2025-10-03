-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.group (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT group_pkey PRIMARY KEY (id)
);
CREATE TABLE public.group_member (
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT group_member_pkey PRIMARY KEY (group_id, user_id),
  CONSTRAINT group_member_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.group(id),
  CONSTRAINT group_member_member_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.match (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_one_id uuid NOT NULL,
  player_two_id uuid NOT NULL,
  sets jsonb NOT NULL DEFAULT '[]'::jsonb,
  winner_id uuid,
  status USER-DEFINED NOT NULL DEFAULT 'waiting'::match_status,
  group_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_surrender boolean DEFAULT false,
  CONSTRAINT match_pkey PRIMARY KEY (id),
  CONSTRAINT match_player_one_id_fkey FOREIGN KEY (player_one_id) REFERENCES public.user(user_id),
  CONSTRAINT match_player_two_id_fkey FOREIGN KEY (player_two_id) REFERENCES public.user(user_id),
  CONSTRAINT match_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.user(user_id),
  CONSTRAINT match_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.group(id)
);
CREATE TABLE public.user (
  user_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_viewer boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT user_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);