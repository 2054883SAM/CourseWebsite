-- Add categorie column to public.courses with allowed values per official classes (Québec elementary)
ALTER TABLE public.courses ADD COLUMN categorie TEXT;

-- Restrict categorie to the allowed values
ALTER TABLE public.courses
  ADD CONSTRAINT courses_categorie_check
  CHECK (categorie IN ('Français', 'Mathématiques', 'Science et technologie', 'Géographie et histoire', 'Culture et citoyenneté québécoise'));


