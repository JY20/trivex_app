'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { popularCurrencies } from '@/lib/currencies';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CurrencyConverterWidgetProps {
  className?: string;
}

interface ExchangeRate {
  [key: string]: number;
}

export default function CurrencyConverterWidget({ className = '' }: CurrencyConverterWidgetProps) {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('CAD');
  const [amount, setAmount] = useState('100');
  const [duration, setDuration] = useState('30'); // Duration in days
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duration options
  const durationOptions = [
    { value: '1', label: '1 Day' },
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' },
  ];

  // Fetch current exchange rate using a free currency API
  const fetchExchangeRate = async () => {
    if (fromCurrency === toCurrency) {
      setExchangeRate(1);
      setConvertedAmount(parseFloat(amount));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Using exchangerate-api.com (free tier)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }

      const data = await response.json();
      const rate = data.rates?.[toCurrency];
      
      if (rate) {
        setExchangeRate(rate);
        setConvertedAmount(parseFloat(amount) * rate);
      } else {
        throw new Error('Exchange rate not available');
      }
    } catch (err) {
      setError('Failed to fetch exchange rate');
      console.error('Exchange rate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock historical data for demonstration
  const generateHistoricalData = () => {
    if (fromCurrency === toCurrency) {
      setHistoricalData(null);
      return;
    }

    // Generate data based on selected duration
    const days = parseInt(duration);
    const baseRate = exchangeRate || 1.35; // Default rate for USD to CAD
    
    // Determine sampling interval based on duration
    let sampleInterval = 1; // Default: every day
    let maxDataPoints = 30; // Maximum data points to show
    
    if (days === 90) {
      sampleInterval = 3; // Every 3 days for 90 days
      maxDataPoints = 30;
    } else if (days === 365) {
      sampleInterval = 7; // Every week for 1 year
      maxDataPoints = 52;
    } else if (days === 30) {
      sampleInterval = 1; // Every day for 30 days
      maxDataPoints = 30;
    } else if (days === 7) {
      sampleInterval = 1; // Every day for 7 days
      maxDataPoints = 7;
    } else if (days === 1) {
      sampleInterval = 1; // Every day for 1 day
      maxDataPoints = 1;
    }
    
    const data: number[] = [];
    const labels: string[] = [];
    const usedLabels = new Set<string>(); // Track used labels to avoid duplicates
    
    // Calculate actual number of data points based on sampling
    const actualDataPoints = Math.min(Math.ceil(days / sampleInterval), maxDataPoints);
    
    for (let i = 0; i < actualDataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - (i * sampleInterval)));
      
      // Format date based on duration
      let dateLabel;
      if (days <= 7) {
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (days <= 30) {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (days === 90) {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (days === 365) {
        // For 1 year, use month and year format
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      
      // Ensure label uniqueness - skip duplicates instead of adding numbers
      if (labels.includes(dateLabel)) {
        continue;
      }
      
      labels.push(dateLabel);
      
      // Add some random variation to the rate
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const rate = baseRate * (1 + variation);
      data.push(rate);
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: `${fromCurrency} to ${toCurrency}`,
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    };

    setHistoricalData(chartData);
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (exchangeRate) {
      setConvertedAmount(parseFloat(amount) * exchangeRate);
      generateHistoricalData();
    }
  }, [amount, exchangeRate, duration]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${durationOptions.find(d => d.value === duration)?.label} ${fromCurrency} to ${toCurrency} Exchange Rate Trend`,
        font: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12, // Limit number of ticks shown
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(4);
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-md bg-white ${className}`}>
      <h2 className="text-xl lg:text-2xl font-bold mb-4">Currency Converter</h2>
      
      {/* Currency Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            From Currency
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full p-2 lg:p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm lg:text-base"
          >
            {popularCurrencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex items-end">
          <button
            onClick={swapCurrencies}
            className="w-full p-2 lg:p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="Swap currencies"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            To Currency
          </label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full p-2 lg:p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm lg:text-base"
          >
            {popularCurrencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4 lg:mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
          className="w-full p-2 lg:p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm lg:text-base"
        />
      </div>

      {/* Conversion Result */}
      <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        {isLoading ? (
          <div className="text-center text-blue-600 text-sm lg:text-base">Converting...</div>
        ) : error ? (
          <div className="text-red-600 text-sm lg:text-base">{error}</div>
        ) : (
          <div className="text-center">
            <div className="text-lg lg:text-2xl font-bold text-blue-700">
              {amount} {fromCurrency} = {convertedAmount?.toFixed(2)} {toCurrency}
            </div>
            {exchangeRate && (
              <div className="text-xs lg:text-sm text-gray-600 mt-1">
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duration Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Chart Duration
        </label>
        <div className="flex flex-wrap gap-1 lg:gap-2">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDuration(option.value)}
              className={`px-2 lg:px-4 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                duration === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Chart */}
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold mb-3">
          {durationOptions.find(d => d.value === duration)?.label} Exchange Rate Trend
        </h3>
        {historicalData ? (
          <div className="h-48 lg:h-64">
            <Line data={historicalData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-48 lg:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-gray-500 text-center text-sm lg:text-base">
              {fromCurrency === toCurrency 
                ? 'Select different currencies to view chart'
                : 'Loading chart data...'
              }
            </div>
          </div>
        )}
      </div>

      {/* Quick Convert Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setAmount('100')}
          className="p-2 text-xs lg:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          100 {fromCurrency}
        </button>
        <button
          onClick={() => setAmount('1000')}
          className="p-2 text-xs lg:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          1000 {fromCurrency}
        </button>
      </div>
    </div>
  );
} 