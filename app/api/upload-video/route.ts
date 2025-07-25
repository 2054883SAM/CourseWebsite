import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { validateApiAuth } from '@/lib/auth/api-middleware';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

// Fonction pour attendre qu'un upload soit terminé et récupérer le playbackId
async function waitForUploadComplete(uploadId: string, maxAttempts: number = 15): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const upload = await muxClient.video.uploads.retrieve(uploadId);
      
      // Vérifier si l'upload est terminé
      if (upload.status === 'asset_created' && upload.asset_id) {
        // Maintenant récupérer l'asset pour obtenir le playbackId
        const asset = await muxClient.video.assets.retrieve(upload.asset_id);
        
        if (asset.status === 'ready' && asset.playback_ids && asset.playback_ids.length > 0) {
          return asset.playback_ids[0].id;
        }
      }
      
      // Attendre 2 secondes avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Tentative ${attempt + 1} échouée:`, error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return null;
}

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
      // Note: assetId n'est pas encore disponible à ce stade
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

// Nouvelle route pour récupérer le playbackId après l'upload
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const { userId, role } = await validateApiAuth(request);
    
    // Vérifier que l'utilisateur est admin ou creator
    if (role !== 'admin' && role !== 'creator') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID requis' },
        { status: 400 }
      );
    }

    // Attendre que l'upload soit terminé et récupérer le playbackId
    const playbackId = await waitForUploadComplete(uploadId);

    if (!playbackId) {
      return NextResponse.json(
        { error: 'PlaybackId non disponible après plusieurs tentatives' },
        { status: 404 }
      );
    }

    return NextResponse.json({ playbackId });

  } catch (error) {
    console.error('Erreur lors de la récupération du playbackId:', error);
    
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