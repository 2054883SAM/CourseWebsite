-- Ajouter un champ bio à la table users
ALTER TABLE users ADD COLUMN bio TEXT;

-- Mettre à jour les types TypeScript
-- Le champ bio sera nullable et permettra aux utilisateurs de décrire leur profil 