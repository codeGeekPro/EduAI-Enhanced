/**
 * 📊 Composant de monitoring des performances en temps réel
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitals {
  cls?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
}

const PerformanceMonitor: React.FC = () => {
  const [vitals, setVitals] = useState<WebVitals>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWebVitals = async () => {
      try {
        const { onCLS, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        onCLS((metric: any) => setVitals(prev => ({ ...prev, cls: metric.value })));
        onFCP((metric: any) => setVitals(prev => ({ ...prev, fcp: metric.value })));
        onLCP((metric: any) => setVitals(prev => ({ ...prev, lcp: metric.value })));
        onTTFB((metric: any) => setVitals(prev => ({ ...prev, ttfb: metric.value })));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load web vitals:', error);
        setLoading(false);
      }
    };

    loadWebVitals();
  }, []);

  const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds: Record<string, [number, number]> = {
      cls: [0.1, 0.25],
      fcp: [1800, 3000],
      lcp: [2500, 4000],
      ttfb: [800, 1800]
    };

    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  };

  const formatValue = (name: string, value: number): string => {
    if (name === 'cls') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  const webVitalsList: WebVital[] = Object.entries(vitals)
    .filter(([_, value]) => value !== undefined)
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value: value!,
      rating: getRating(name, value!)
    }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement des métriques de performance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Web Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webVitalsList.map((vital) => (
            <div key={vital.name} className="flex justify-between items-center">
              <span className="font-medium">{vital.name}</span>
              <div className="flex items-center gap-2">
                <span>{formatValue(vital.name.toLowerCase(), vital.value)}</span>
                <div className={`w-3 h-3 rounded-full ${
                  vital.rating === 'good' ? 'bg-green-500' :
                  vital.rating === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
