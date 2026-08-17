import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CropRecommendations({ recommendations, state }) {
  const { t } = useTranslation();
  if (!recommendations || (!recommendations.best?.length && !recommendations.average?.length)) {
    return null;
  }

  const getMatchColor = (matchPercent) => {
    if (matchPercent >= 80) return 'bg-green-50 border-green-300 text-green-800';
    if (matchPercent >= 60) return 'bg-blue-50 border-blue-300 text-blue-800';
    if (matchPercent >= 40) return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    return 'bg-orange-50 border-orange-300 text-orange-800';
  };

  const getCropEmoji = (cropName) => {
     const emojis = {
       'Wheat': '🌾',
       'wheat': '🌾',
       'Rice': '🍚',
       'rice': '🍚',
       'Maize': '🌽',
       'maize': '🌽',
       'Sugarcane': '🍯',
       'sugarcane': '🍯',
       'Bajra': '🌾',
       'bajra': '🌾',
       'Soybean': '🫘',
       'soybean': '🫘',
       'Groundnut': '🥜',
       'groundnut': '🥜',
       'Barley': '🌾',
       'barley': '🌾',
       'Cotton': '☁️',
       'cotton': '☁️',
       'Pulses': '🫘',
       'pulses': '🫘'
     };
     return emojis[cropName] || '🌱';
   };
   
   const getTranslatedCropName = (cropName) => {
     // Normalize crop name
     const normalized = cropName.toLowerCase().trim();
     try {
       return t(`crops.${normalized}`);
     } catch (err) {
       return cropName;
     }
   };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
       <div className="flex items-center space-x-2 mb-4">
         <TrendingUp className="w-6 h-6 text-green-600" />
         <h2 className="text-xl font-bold text-gray-800">{t('soilHealth.title')}</h2>
       </div>
       
       {state && (
         <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
           📍 {t('realFarmerResult.subtitle', { state })} <span className="font-semibold">{state}</span>
         </div>
       )}

      {recommendations.best && recommendations.best.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <img src="/logo.png" alt="Agro-Rakshak" className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-green-800">
              {t('soilHealth.highlyRecommended')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.best.map((crop, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${getMatchColor(crop.matchPercent)} transition-all hover:shadow-md`}
              >
                 <div className="flex items-center justify-between mb-2">
                   <div className="text-2xl mr-2">{getCropEmoji(crop.name)}</div>
                   <div>
                     <div className="font-semibold">{getTranslatedCropName(crop.name)}</div>
                     <div className="text-sm font-bold">{crop.matchPercent}% {t('common.confidence')}</div>
                   </div>
                 </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${crop.matchPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">{crop.matchLevel} suitability</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.average && recommendations.average.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">
              {t('soilHealth.moderateOptions')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.average.map((crop, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${getMatchColor(crop.matchPercent)} transition-all hover:shadow-md`}
              >
                 <div className="flex items-center justify-between mb-2">
                   <div className="text-2xl mr-2">{getCropEmoji(crop.name)}</div>
                   <div>
                     <div className="font-semibold text-sm">{getTranslatedCropName(crop.name)}</div>
                     <div className="text-sm font-bold">{crop.matchPercent}% {t('common.confidence')}</div>
                   </div>
                 </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${crop.matchPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">{crop.matchLevel} suitability</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.notRecommended && recommendations.notRecommended.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            {t('soilHealth.notRecommended', { count: recommendations.notRecommended.length })}
          </h3>
          <div className="text-xs text-gray-600 bg-red-50 p-2 rounded border border-red-200">
            {recommendations.notRecommended.slice(0, 3).map((c) => c.name).join(', ')}
            {recommendations.notRecommended.length > 3 && ` +${recommendations.notRecommended.length - 3} more`}
          </div>
        </div>
      )}

      <div className="mt-4 bg-green-50 border-l-4 border-green-600 p-3 text-xs text-gray-700">
        <strong>💡 {t('soilHealth.tipLabel')} </strong>
        {t('soilHealth.recommendationTip')}
      </div>
    </div>
  );
}
