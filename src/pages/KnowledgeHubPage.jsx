import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, PlayCircle, BookOpen } from 'lucide-react';

const KNOWLEDGE_ITEMS = [
  {
    id: 1,
    title: 'Introduction to Protective Cultivation Techniques',
    category: 'protective-cultivation',
    difficulty: 'beginner',
    videoId: 'tS8xrD5Y7oU'
  },
  {
    id: 2,
    title: 'Advanced Polyhouse Setup and Management',
    category: 'polyhouses',
    difficulty: 'expert',
    videoId: 'quMNdpNatuM'
  },
  {
    id: 3,
    title: 'Drip Irrigation System Installation Guide',
    category: 'drip-irrigation',
    difficulty: 'beginner',
    videoId: 'RnrfS8YioSg'
  },
  {
    id: 4,
    title: 'Organic Farming: Composting and Soil Health',
    category: 'organic-farming',
    difficulty: 'beginner',
    videoId: '30Jw3d7Cy5M'
  },
  {
    id: 5,
    title: 'Optimizing Crop Yield in Polyhouses',
    category: 'polyhouses',
    difficulty: 'expert',
    videoId: 'hkxS1wp7BRM'
  },
  {
    id: 6,
    title: 'Water Conservation with Smart Drip Systems',
    category: 'drip-irrigation',
    difficulty: 'expert',
    videoId: 'tA80HqSiX-8'
  },
  {
    id: 7,
    title: 'Protective Cultivation for High-Value Crops',
    category: 'protective-cultivation',
    difficulty: 'expert',
    videoId: 'N2395BTBoqQ'
  },
  {
    id: 8,
    title: 'Organic Pest Management Strategies',
    category: 'organic-farming',
    difficulty: 'beginner',
    videoId: 'Uo05345F1C8'
  }
];

export default function KnowledgeHubPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    if (category === 'all') return KNOWLEDGE_ITEMS;
    return KNOWLEDGE_ITEMS.filter(item => item.category === category);
  }, [category]);

  const categoryLabel = (key) => {
    switch (key) {
      case 'all':
        return t('knowledgeHub.allTopics', 'All Topics');
      case 'protective-cultivation':
        return t('knowledgeHub.protectiveCultivation', 'Protective Cultivation');
      case 'polyhouses':
        return t('knowledgeHub.polyhouses', 'Polyhouses');
      case 'drip-irrigation':
        return t('knowledgeHub.dripIrrigation', 'Drip Irrigation');
      case 'organic-farming':
        return t('knowledgeHub.organicFarming', 'Organic Farming');
      default:
        return key;
    }
  };

  const difficultyClass = (difficulty) => {
    if (difficulty === 'beginner') return 'bg-green-100 text-green-700 border-green-200';
    if (difficulty === 'expert') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('weatherIntelligence.backToDashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('knowledgeHub.title')}</h1>
          <div className="w-24" /> 
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page header */}
        <section className="glass-card rounded-3xl p-8 bg-white flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-text-primary mb-2">{t('knowledgeHub.title')}</h2>
            <p className="text-text-secondary text-lg max-w-2xl">
              {t('knowledgeHub.subtitle')}
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {['all', 'protective-cultivation', 'polyhouses', 'drip-irrigation', 'organic-farming'].map(key => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                category === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-text-secondary hover:bg-gray-50 border border-border'
              }`}
            >
              {categoryLabel(key)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-border">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {t('knowledgeHub.noTutorials')}
            </h3>
            <p className="text-text-secondary">
              {t('knowledgeHub.tryDifferent')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(item => {
              const thumb = `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`;
              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={thumb}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${difficultyClass(
                        item.difficulty
                      )}`}
                    >
                      {t(`knowledgeHub.difficulty.${item.difficulty}`, item.difficulty)}
                    </span>
                    
                    <button
                      onClick={() =>
                        window.open(`https://www.youtube.com/watch?v=${item.videoId}`, '_blank')
                      }
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                    >
                      <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <PlayCircle className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </button>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-text-secondary">
                        {categoryLabel(item.category)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-text-primary mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                      {t(`knowledgeHub.tutorialTitles.${item.id}`, item.title)}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <button
                        onClick={() =>
                          window.open(`https://www.youtube.com/watch?v=${item.videoId}`, '_blank')
                        }
                        className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-2"
                      >
                        {t('knowledgeHub.playVideo')}
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

