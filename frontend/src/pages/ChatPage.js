import React from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';

const ChatPage = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('dashboard.chat')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        This page is under construction.
      </p>
    </Layout>
  );
};

export default ChatPage;
