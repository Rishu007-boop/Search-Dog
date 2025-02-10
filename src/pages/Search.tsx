import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, Search as SearchIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/auth';
import { useFavoritesStore } from '../store/favorites';
import { getBreeds, getDogs, logout, searchDogs } from '../lib/api';
import type { Dog } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export default function Search() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const favorites = useFavoritesStore((state) => state.favorites);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breedList = await getBreeds();
        setBreeds(breedList);
      } catch (error) {
        toast.error('Failed to fetch breeds');
      }
    };
    fetchBreeds();
  }, []);

  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);
      try {
        const response = await searchDogs({
          breeds: selectedBreeds,
          size: 20,
          from: page * 20,
          sort: `breed:${sortOrder}`,
        });
        const dogList = await getDogs(response.resultIds);
        setDogs(dogList);
        setTotal(response.total);
      } catch (error) {
        toast.error('Failed to fetch dogs');
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, [selectedBreeds, page, sortOrder]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const filteredBreeds = breeds.filter((breed) =>
    breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFavorite = (dogId: string) => favorites.some((dog) => dog.id === dogId);

  const toggleFavorite = (dog: Dog) => {
    if (isFavorite(dog.id)) {
      removeFavorite(dog.id);
    } else {
      addFavorite(dog);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Dog</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/match')}
              disabled={favorites.length === 0}
            >
              <Heart className="w-5 h-5 mr-2" />
              Favorites ({favorites.length})
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-[300px,1fr]">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Breeds
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search breeds..."
                  className="pl-10"
                />
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredBreeds.map((breed) => (
                <label key={breed} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBreeds.includes(breed)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBreeds([...selectedBreeds, breed]);
                      } else {
                        setSelectedBreeds(selectedBreeds.filter((b) => b !== breed));
                      }
                      setPage(0);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{breed}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {dogs.length} of {total} results
              </div>
              <Button
                variant="secondary"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                Sort {sortOrder === 'asc' ? '↓' : '↑'}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dogs.map((dog) => (
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
                      <button
                        onClick={() => toggleFavorite(dog)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            isFavorite(dog.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-gray-600">
                      <span>{dog.age} years old</span>
                      <span>{dog.zip_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={dogs.length < 20}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}