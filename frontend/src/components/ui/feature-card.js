import React from 'react';
import { Card, CardContent } from './card';

export const FeatureCard = ({ icon, title, description }) => (
  <Card className="p-0">
    <CardContent>
      <div className="text-primary-700 dark:text-primary-400 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </CardContent>
  </Card>
);

export default FeatureCard;