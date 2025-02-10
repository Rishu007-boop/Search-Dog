import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFavoritesStore } from '../store/favorites';
import { getDogs, matchDog } from '../lib/api';
import type { Dog } from '../types';
import { Button } from '../components/Button';

export default function Match() {
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const favorites = useFavoritesStore((state) => state.favorites);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);

  const generateMatch = async () => {
    setLoading(true);
    try {
      const { match } = await matchDog(favorites.map((dog) => dog.id));
      const [dog] = await getDogs([match]);
      setMatchedDog(dog);
    } catch (error) {
      toast.error('Failed to generate match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/search')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Search
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your Favorites</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {matchedDog ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  We found your perfect match!
                </h2>
                <p className="text-gray-600 mb-8">
                  Based on your favorites, we think you'll love:
                </p>
              </div>
              <img
                src={matchedDog.img}
                alt={matchedDog.name}
                className="w-full h-96 object-cover"
              />
              <div className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {matchedDog.name}
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">{matchedDog.breed}</p>
                  <div className="flex justify-center space-x-8 text-gray-600">
                    <span>{matchedDog.age} years old</span>
                    <span>{matchedDog.zip_code}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button
                onClick={() => {
                  clearFavorites();
                  navigate('/search');
                }}
              >
                Start New Search
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {favorites.map((dog) => (
                <div key={dog.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={dog.img}
                    alt={dog.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{dog.name}</h3>
                        <p className="text-sm text-gray-600">{dog.breed}</p>
                      </div>
                      <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-gray-600">
                      <span>{dog.age} years old</span>
                      <span>{dog.zip_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button
                size="lg"
                onClick={generateMatch}
                disabled={loading || favorites.length === 0}
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Generate Match
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}