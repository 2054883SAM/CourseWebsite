-- Mettre à jour la bio de Samuel Beausejour
UPDATE users 
SET bio = 'Samuel Beausejour est un éducateur passionné avec une expertise dans divers domaines de la technologie et de la programmation. Avec des années d''expérience dans l''industrie, il apporte des connaissances pratiques et des meilleures pratiques à ses cours.'
WHERE name = 'Samuel Beausejour';

-- Vérifier que la mise à jour a fonctionné
SELECT name, bio FROM users WHERE name = 'Samuel Beausejour'; 