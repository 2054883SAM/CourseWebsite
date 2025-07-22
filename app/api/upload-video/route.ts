import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { validateApiAuth } from '@/lib/auth/api-middleware';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const { userId, role } = await validateApiAuth(request);
    
    // Vérifier que l'utilisateur est admin ou creator
    if (role !== 'admin' && role !== 'creator') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins and creators can upload videos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    // Créer un upload URL signé avec Mux
    const upload = await muxClient.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'], // Rendre la vidéo publique pour la lecture
        // Supprimé mp4_support car pas autorisé sur les comptes basiques
      },
      cors_origin: '*', // Permettre l'upload depuis n'importe quelle origine
      test: false, // Production mode
    });

    // Retourner les informations d'upload
    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
      assetId: upload.asset_id,
      playbackId: upload.asset_id, // Le playback ID sera disponible une fois l'upload terminé
      status: 'ready',
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'upload Mux:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 