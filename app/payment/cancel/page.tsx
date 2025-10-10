import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen background-beige flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-700 via-red-500 to-red-700 px-8 py-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
              <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 left-8 w-4 h-4 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-8 right-4 w-10 h-10 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-2">Paiement Annulé</h1>
              <p className="text-red-100 text-lg">Aucun frais n'a été prélevé</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                😔 Pas de souci !
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Votre paiement a été annulé en toute sécurité. 
                Vous pouvez réessayer à tout moment quand vous serez prêt !
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/"
                className="group flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Retour à l'accueil
              </Link>
              <Link
                href="/payment"
                className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Réessayer le paiement
                <svg className="w-5 h-5 ml-2 group-hover:transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>

            {/* Help Message */}
            <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Besoin d'aide ?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">💳</span>
                  Vérifiez vos informations de paiement
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">🔒</span>
                  Paiement 100% sécurisé
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">📞</span>
                  Support client disponible
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-red-500 mr-2">⏰</span>
                  Réessayez quand vous voulez
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


