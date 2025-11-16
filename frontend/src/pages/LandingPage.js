import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: t('landing.aiAnalysis'),
      description: t('landing.aiAnalysisDesc'),
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: t('landing.autoReports'),
      description: t('landing.autoReportsDesc'),
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: t('landing.medicalTracking'),
      description: t('landing.medicalTrackingDesc'),
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('landing.completeHistory'),
      description: t('landing.completeHistoryDesc'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <section className="pt-24 pb-20 bg-gradient-to-b from-gray-950 via-gray-900 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary-800 bg-primary-900/30 text-primary-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L12.9 14.347a1 1 0 00-1.175 0l-2.935 2.144c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L5.158 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Sistema Inteligente de Avaliação de Feridas
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              A plataforma inteligente para
              <span className="block text-primary-400">gestão de feridas</span>
            </h1>
            <p className="text-lg md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Utilize IA com Gemini para análise de imagens, geração de relatórios e acompanhamento de progressão de feridas.
            </p>

            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-900/30"
              >
                {t('landing.getStarted')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-white/10"
              >
                <div className="text-primary-700 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Junte-se a profissionais de saúde que confiam no Heal+
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-primary-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow"
          >
            {t('landing.getStarted')}
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 Heal+. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;