-- ============================================================
-- DGTE Liga — Schema Migration 001
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: membership_payment
-- Tracks per-user, per-month, per-year payment status
CREATE TABLE IF NOT EXISTS membership_payment (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL,
  year       integer NOT NULL,
  month      integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  paid       boolean NOT NULL DEFAULT false,
  marked_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, year, month)
);

-- Table: rule_block
-- Stores editable rule sections shown on the Pravila page
CREATE TABLE IF NOT EXISTS rule_block (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order  integer NOT NULL DEFAULT 10,
  title       text NOT NULL,
  content     text NOT NULL DEFAULT '',
  updated_at  timestamptz DEFAULT now()
);

-- Seed initial rule blocks from the existing hardcoded content
INSERT INTO rule_block (sort_order, title, content) VALUES
(10, 'Kako funkcionira liga', 
'- Skupine sadrže 4 igrača, na kraju mjeseca najbolje plasirani u skupini prelazi u jaču skupinu, a najlošije plasirani u slabiju skupinu
- Svatko igra 3 meča u mjesecu
- Uplata lige ide na početku mjeseca, odnosno kod rezervacije prvog meča će biti provjera, ukoliko nekome ne odgovara, može se sve dogovoriti sa voditeljem lige
- Tijekom godine se planira 2 Kupa i 1 Masters
- Poredak u ligi će imati utjecaja na pored na Kupu, a bodovi iz lige i sa Kupova će formirati popis od 12 najboljih igrača koji će imati pravo nastupiti na finalnom Mastersu'),
(20, 'Vanjski tereni',
'**Rezervacija termina:** 2 sata

**Format igre:** Igra se 2 seta do 6 (tie brake do 7)'),
(30, 'Balon (unutarnji tereni)',
'**Rezervacija termina:** 1,5 sat

**Format igre:** Igra se 2 seta (kreće se od 2:2), tie brake do 7');
