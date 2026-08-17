import React from 'react';
import { Lightbulb, Droplets, Wind, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SoilImprovements({ suggestions, ph, moisture, om, soilType, nitrogen = 180, phosphorus = 25, potassium = 190 }) {
  const { t } = useTranslation();
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const getSuggestionIcon = (suggestion) => {
    if (suggestion.toLowerCase().includes('water') || suggestion.toLowerCase().includes('moisture') || suggestion.toLowerCase().includes('irrigation')) {
      return <Droplets className="w-5 h-5 text-blue-600" />;
    }
    if (suggestion.toLowerCase().includes('organic') || suggestion.toLowerCase().includes('compost') || suggestion.toLowerCase().includes('manure')) {
      return <Lightbulb className="w-5 h-5 text-green-600" />;
    }
    if (suggestion.toLowerCase().includes('aeration') || suggestion.toLowerCase().includes('drain') || suggestion.toLowerCase().includes('nitrogen') || suggestion.toLowerCase().includes('phosphorus') || suggestion.toLowerCase().includes('potassium')) {
      return <Wind className="w-5 h-5 text-orange-600" />;
    }
    if (suggestion.toLowerCase().includes('lime') || suggestion.toLowerCase().includes('sulfur') || suggestion.toLowerCase().includes('ph')) {
      return <Flame className="w-5 h-5 text-red-600" />;
    }
    return <Lightbulb className="w-5 h-5 text-green-600" />;
  };

  const getHealthStatus = () => {
    let healthScore = 0;

    // pH assessment (25%)
    if (ph >= 6.0 && ph <= 7.5) healthScore += 25;
    else if (ph >= 5.5 && ph <= 8.0) healthScore += 15;
    else healthScore += 5;

    // Moisture assessment (20%)
    if (moisture >= 15 && moisture <= 25) healthScore += 20;
    else if (moisture >= 12 && moisture <= 30) healthScore += 12;
    else healthScore += 4;

    // Organic Matter assessment (20%)
    if (om >= 2.0) healthScore += 20;
    else if (om >= 1.2) healthScore += 16;
    else if (om >= 0.8) healthScore += 10;
    else if (om >= 0.5) healthScore += 5;
    else healthScore += 2;

    // Nitrogen assessment (12%)
    if (nitrogen >= 180) healthScore += 12;
    else if (nitrogen >= 160) healthScore += 9;
    else if (nitrogen >= 140) healthScore += 6;
    else healthScore += 2;

    // Phosphorus assessment (12%)
    if (phosphorus >= 25) healthScore += 12;
    else if (phosphorus >= 20) healthScore += 9;
    else if (phosphorus >= 15) healthScore += 6;
    else healthScore += 2;

    // Potassium assessment (11%)
    if (potassium >= 190) healthScore += 11;
    else if (potassium >= 160) healthScore += 8;
    else if (potassium >= 140) healthScore += 5;
    else healthScore += 2;

    // Soil Type
    if (soilType === 'loamy' || soilType === 'clay-loam' || soilType === 'sandy-loam') healthScore += 5;
    else healthScore += 2;

    return Math.min(100, Math.round(healthScore));
  };

  const healthScore = getHealthStatus();
  const healthStatus = healthScore >= 85 ? t('soilHealth.excellent') : healthScore >= 70 ? t('soilHealth.good') : healthScore >= 55 ? t('soilHealth.average') : t('soilHealth.poor');
  const healthColor = healthScore >= 85 ? 'text-green-600' : healthScore >= 70 ? 'text-green-500' : healthScore >= 55 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🌿 Soil Improvement Suggestions</h2>

      {/* Soil Health Score */}
      <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-700">Soil Health Index</div>
            <div className={`text-3xl font-bold ${healthColor}`}>{healthScore}/100</div>
          </div>
          <div className={`text-lg font-semibold ${healthColor}`}>{healthStatus}</div>
        </div>
        <div className="mt-3 w-full bg-gray-300 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              healthScore >= 85 ? 'bg-green-600' : healthScore >= 70 ? 'bg-green-500' : healthScore >= 55 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>
      </div>

      {/* Current Parameters Summary */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
          <div className="text-xs text-gray-600">pH Level</div>
          <div className="text-lg font-bold text-blue-700">{ph}</div>
          <div className="text-xs text-gray-500 mt-1">{ph >= 6.0 && ph <= 7.5 ? '✓ Good' : '⚠ Adjust'}</div>
        </div>
        <div className="bg-cyan-50 p-3 rounded border border-cyan-200 text-center">
          <div className="text-xs text-gray-600">Moisture</div>
          <div className="text-lg font-bold text-cyan-700">{moisture}%</div>
          <div className="text-xs text-gray-500 mt-1">{moisture >= 15 && moisture <= 25 ? '✓ Good' : '⚠ Adjust'}</div>
        </div>
        <div className="bg-amber-50 p-3 rounded border border-amber-200 text-center">
          <div className="text-xs text-gray-600">Organic Matter</div>
          <div className="text-lg font-bold text-amber-700">{om}%</div>
          <div className="text-xs text-gray-500 mt-1">{om >= 1.5 ? '✓ Good' : '⚠ Low'}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center">
          <div className="text-xs text-gray-600">Soil Type</div>
          <div className="text-lg font-bold text-purple-700 capitalize">{soilType}</div>
          <div className="text-xs text-gray-500 mt-1">
            {soilType === 'loamy' || soilType === 'clay-loam' ? '✓ Good' : '⚠ Fair'}
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 mb-3">Recommended Actions:</h3>
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-600 hover:shadow-md transition-all"
          >
            <div className="mt-1 flex-shrink-0">
              {getSuggestionIcon(suggestion)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{suggestion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tips section */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h4 className="font-semibold text-yellow-900 text-sm mb-2">💡 Quick Tips:</h4>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>✓ Test soil every 1-2 years to track improvements</li>
          <li>✓ Start with compost/manure to gradually improve soil</li>
          <li>✓ Practice crop rotation to maintain soil fertility</li>
          <li>✓ Reduce chemical fertilizers and adopt sustainable practices</li>
          <li>✓ Monitor after implementing suggestions; adjust as needed</li>
        </ul>
      </div>
    </div>
  );
}
