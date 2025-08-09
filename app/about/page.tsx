'use client';

import { PageLayout, Section, Container } from '@/components/layout';
import { withAuth } from '@/components/auth/withAuth';
import { EzioProfile } from '@/components/team/EzioProfile';

function AboutPage() {
  return (
    <PageLayout>
      <Section className="bg-gradient-gray py-20">
        <Container>
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 via-gold-600 to-gray-800 bg-clip-text text-transparent dark:from-white dark:via-gold-400 dark:to-gray-300">
              À Propos d'EzioAcademy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Découvrez l'équipe derrière EzioAcademy et notre mission de démocratiser l'apprentissage en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Chez EzioAcademy, nous croyons que l'éducation de qualité devrait être accessible à tous. 
                Notre plateforme connecte les apprenants passionnés avec des experts du secteur pour 
                créer une expérience d'apprentissage exceptionnelle.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Nous nous engageons à fournir des cours de haute qualité, des outils d'apprentissage 
                innovants et un support communautaire pour aider nos utilisateurs à atteindre leurs 
                objectifs professionnels et personnels.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Nos Valeurs
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Qualité et excellence dans chaque cours</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Accessibilité pour tous les apprenants</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Innovation technologique continue</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Communauté d'apprentissage solidaire</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Notre Équipe
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <EzioProfile />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Ezio Wassim H.
                    </h3>
                    <p className="text-lg text-gold-600 dark:text-gold-400 mb-4">
                      Fondateur & CEO
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Passionné par l'éducation et la technologie, Ezio a fondé EzioAcademy avec la vision 
                      de créer une plateforme d'apprentissage accessible et innovante. Son expertise en 
                      finance et son engagement pour l'éducation de qualité font de lui un leader 
                      inspirant dans le domaine de l'edtech.
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4">
                      <a
                        href="https://www.linkedin.com/in/ezio-wassim-h-773187115/?originalSubdomain=ca"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
                            clipRule="evenodd"
                          />
                        </svg>
                        LinkedIn
                      </a>
                      <a
                        href="https://www.instagram.com/eziofinance/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Découvrez nos cours, connectez-vous avec d'autres apprenants et commencez votre 
              parcours d'apprentissage dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/courses"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200"
              >
                Découvrir les Cours
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-200"
              >
                Nous Contacter
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}

export default withAuth(AboutPage, { requireAuth: false }); 