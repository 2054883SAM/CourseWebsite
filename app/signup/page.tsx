import { SignUp } from '@/components/auth/SignUp';
import { Metadata } from 'next';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: "S'inscrire - EduKids",
  description: 'Créez un nouveau compte pour commencer à apprendre',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex background-beige relative">

      {/* Stripes de livre sur toute la page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: `
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              #f59e0b 31px,
              #f59e0b 32px
            )
          `,
          backgroundSize: '100% 32px',
          opacity: 0.3
        }}></div>
        {/* Marge orange a droite */}
        <div className="absolute left-0 top-0 w-8 h-full border-s-4 border-orange-300"></div>
      </div>

      {/* Section gauche - formulaire d'inscription */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <Logo className="text-6xl" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {String(metadata.title)}
            </h1>
            <p className="text-gray-600">
              {String(metadata.description)}
            </p>
          </div>

          {/* Header desktop*/}
          <div className="hidden lg:block mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold" style={{
              fontFamily: 'cursive',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              transform: 'rotate(-0.5deg)',
              color: '#1f2937'
            }}>
              {String(metadata.title)}
            </h1>
            <p style={{
              fontFamily: 'cursive',
              transform: 'rotate(0.3deg)',
              color: '#374151'
            }}>
              {String(metadata.description)}
            </p>
          </div>

          {/* Formulaire*/}
          <div className="px-6 py-8" style={{
            background: 'transparent',
            position: 'relative',
            marginTop: '16px'
          }}>
            <div style={{
              fontFamily: 'cursive',
              color: '#1f2937',
              lineHeight: '32px',
              fontSize: '16px'
            }}>
              <SignUp />
            </div>
          </div>

          {/* Footer*/}
          <div className="mt-8 text-center">
            <p style={{
              fontFamily: 'cursive',
              transform: 'rotate(-0.2deg)',
              fontSize: '0.8rem',
              color: '#6b7280'
            }}>
              © 2024 EduKidz. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

      {/* Section droite - décorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-l-2 border-amber-200 backdrop-blur-md">
        {/* Background transparent avec flou */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-orange-100/20 to-yellow-100/30 backdrop-blur-md"></div>
        
        {/* Lignes de cahier subtiles */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `
              repeating-linear-gradient(
                transparent,
                transparent 31px,
                #f59e0b 31px,
                #f59e0b 32px
              )
            `,
            backgroundSize: '100% 32px'
          }}></div>
        </div>
        
        {/* Contenu a droite */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <div style={{
              filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.3))',
              animation: 'float 6s ease-in-out infinite'
            }}>
              <Logo size="lg" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-amber-800 mb-4" style={{
            textShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
            animation: 'float 8s ease-in-out infinite'
          }}>Nouveau sur EduKidz ?</h2>
          <p className="text-xl text-amber-700 leading-relaxed mb-6" style={{
            textShadow: '0 0 5px rgba(245, 158, 11, 0.3)'
          }}>
            Créez votre compte et découvrez une nouvelle façon d'apprendre avec nos cours interactifs.
          </p>
          <a 
            href="/signin" 
            className="auth-hidden-btn group"
          >
            <span className="button-glow"></span>
            Déjà membre ? Connectez-vous
          </a>
        </div>
      </div>
    </div>
  );
}
