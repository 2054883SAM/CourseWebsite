import { SignIn } from '@/components/auth/SignIn';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Connexion - EduKids',
  description: 'Connectez-vous à votre compte pour accéder à vos cours',
};

export default function SignInPage() {
  return (
    <div className="background-beige relative flex min-h-screen">
      {/* Stries de livre sur toute la page */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              #f59e0b 31px,
              #f59e0b 32px
            )
          `,
            backgroundSize: '100% 32px',
            opacity: 0.3,
          }}
        ></div>
        {/* Marge orange a droite */}
        <div className="absolute left-0 top-0 h-full w-8 border-s-4 border-orange-300"></div>
      </div>

      {/* Section gauche*/}
      <div className="relative hidden overflow-hidden border-r-2 border-amber-200 backdrop-blur lg:flex lg:w-1/2">
        {/* Lignes de cahier*/}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
              repeating-linear-gradient(
                transparent,
                transparent 31px,
                #f59e0b 31px,
                #f59e0b 32px
              )
            `,
              backgroundSize: '100% 32px',
            }}
          ></div>
        </div>

        {/* Contenu a gauche */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-8">
            <div
              className="mb-6"
              style={{
                filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.3))',
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <Logo size="lg" />
            </div>
          </div>
          <h2
            className="mb-4 text-4xl font-bold text-amber-800"
            style={{
              textShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
              animation: 'float 8s ease-in-out infinite',
            }}
          >
            Nouveau sur EduKidz ?
          </h2>
          <p
            className="mb-6 text-xl leading-relaxed text-amber-700"
            style={{
              textShadow: '0 0 5px rgba(245, 158, 11, 0.3)',
            }}
          >
            Créez votre compte et découvrez une nouvelle façon d{"'"}apprendre avec nos cours
            interactifs.
          </p>
          <a href="/signup" className="auth-hidden-btn group">
            <span className="button-glow"></span>
            Créez un compte
          </a>
        </div>
      </div>

      {/* Section droite - formulaire de connexion */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-6 flex justify-center">
              <Logo className="text-6xl" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">{String(metadata.title)}</h1>
            <p className="text-gray-600">{String(metadata.description)}</p>
          </div>

          {/* Header desktop*/}
          <div className="hidden text-center lg:block">
            <h1
              className="mb-2 text-3xl font-bold"
              style={{
                fontFamily: 'cursive',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                transform: 'rotate(-0.5deg)',
                color: '#1f2937',
              }}
            >
              {String(metadata.title)}
            </h1>
            <p
              style={{
                fontFamily: 'cursive',
                transform: 'rotate(0.3deg)',
                color: '#374151',
              }}
            >
              {metadata.description}
            </p>
          </div>

          {/* Formulaire */}
          <Suspense
            fallback={
              <div className="px-6 py-8">
                <div className="text-center text-gray-600" style={{ fontFamily: 'cursive' }}>
                  Chargement…
                </div>
              </div>
            }
          >
            <div
              className="px-6 py-8"
              style={{
                background: 'transparent',
                position: 'relative',
                marginTop: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'cursive',
                  color: '#1f2937',
                  lineHeight: '32px',
                  fontSize: '16px',
                }}
              >
                <SignIn />
              </div>
            </div>
          </Suspense>

          {/* Footer*/}
          <div className="mt-8 text-center">
            <p
              style={{
                fontFamily: 'cursive',
                transform: 'rotate(-0.2deg)',
                fontSize: '0.8rem',
                color: '#6b7280',
              }}
            >
              © 2024 EduKidz. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
