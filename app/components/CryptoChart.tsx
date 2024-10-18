'use client'

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CryptoChartProps {
  contractAddress: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ contractAddress }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Ici, vous devrez implémenter la logique pour récupérer les données du graphique
        // Cela dépendra de l'API que vous utilisez pour obtenir les données historiques des prix
        // Pour cet exemple, nous utiliserons des données factices
        const mockData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Prix',
              data: [65, 59, 80, 81, 56, 55],
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        };
        setChartData(mockData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du graphique:', error);
      }
    };

    fetchChartData();
  }, [contractAddress]);

  if (!chartData) {
    return <div>Chargement du graphique...</div>;
  }

  return (
    <div className="w-full max-w-2xl">
      <Line data={chartData} />
    </div>
  );
};

export default CryptoChart;
