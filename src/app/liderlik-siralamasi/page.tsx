'use client';

import { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Trophy, Star, Filter, Award, Medal, Crown, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LiderlikSiralamasi() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('overallAverage');
  const [sortDirection, setSortDirection] = useState('desc');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        let q;
        
        if (sortBy === 'toplamGol' || sortBy === 'toplamAsist') {
          q = query(usersRef, orderBy(sortBy, sortDirection));
        } else if (sortBy.startsWith('puanlar.')) {
          const position = sortBy.split('.')[1];
          q = query(usersRef, orderBy(`puanlar.${position}.average`, sortDirection));
        } else {
          q = query(usersRef, orderBy(sortBy, sortDirection));
        }

        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUsers(usersData);
      } catch (error) {
        console.error("Kullanıcıları çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sortBy, sortDirection]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (index) => {
    const badges = [
      { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500', text: 'text-white', shadow: 'shadow-yellow-200' },
      { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-white', shadow: 'shadow-gray-200' },
      { bg: 'bg-gradient-to-r from-amber-500 to-amber-600', text: 'text-white', shadow: 'shadow-amber-200' }
    ];
    
    if (index < 3) {
      return `${badges[index].bg} ${badges[index].text} shadow-lg ${badges[index].shadow}`;
    }
    return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Trophy className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-slate-700 text-xl font-semibold">Sıralamalar yükleniyor...</p>
          <p className="text-slate-500 text-sm mt-2">En iyi performansları getiriyoruz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Liderlik Sıralaması
            </h1>
          </div>
          <p className="text-slate-600 text-lg">En iyi performans gösteren oyuncular</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <Filter className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-lg">Sıralama Seçenekleri</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSort('overallAverage')}
              className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                sortBy === 'overallAverage' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'
              }`}
            >
              <Star className="w-4 h-4" />
              Genel Puan
            </button>
            
            <button
              onClick={() => handleSort('toplamGol')}
              className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                sortBy === 'toplamGol' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'
              }`}
            >
              <Target className="w-4 h-4" />
              Toplam Gol
            </button>
            
            <button
              onClick={() => handleSort('toplamAsist')}
              className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                sortBy === 'toplamAsist' 
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-200' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'
              }`}
            >
              <Zap className="w-4 h-4" />
              Toplam Asist
            </button>
            
            <select
              value={sortBy.startsWith('puanlar.') ? sortBy : ''}
              onChange={(e) => handleSort(e.target.value)}
              className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            >
              <option value="">🎯 Mevki Seçin</option>
              <option value="puanlar.Kaleci">🥅 Kaleci</option>
              <option value="puanlar.Defans">🛡️ Defans</option>
              <option value="puanlar.OrtaSaha">⚽ Orta Saha</option>
              <option value="puanlar.Forvet">🎯 Forvet</option>
              <option value="puanlar.Kanat">⚡ Kanat</option>
              <option value="puanlar.Bek">🔄 Bek</option>
            </select>
            
            <button
              onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 hover:shadow-md transition-all duration-200"
            >
              {sortDirection === 'desc' ? '📉 Azalan' : '📈 Artan'}
            </button>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-slate-700 mb-8 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Şampiyonlar Podyumu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.slice(0, 3).map((user, index) => (
              <div 
                key={user.id} 
                className={`relative group transform transition-all duration-300 hover:scale-105 ${
                  index === 0 ? 'md:order-2 md:-mt-4' : index === 1 ? 'md:order-1' : 'md:order-3'
                }`}
              >
                <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${
                  index === 0 ? 'border-yellow-300' : index === 1 ? 'border-slate-300' : 'border-amber-300'
                }`}>
                  
                  {/* Podium Header */}
                  <div className={`relative h-4 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                    index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400' : 
                    'bg-gradient-to-r from-amber-400 to-amber-500'
                  }`}>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                      {getRankIcon(index)}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Profile Section */}
                    <div className="text-center mb-6">
                      <div className="relative inline-block mb-4">
                        <img
                          src={user.photoURL || '/default-avatar.png'}
                          alt={user.name}
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>')}`;
                          }}
                        />
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadge(index)}`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{user.name}</h3>
                      <p className="text-slate-500 text-sm font-medium">{user.anaMevki || 'Mevki belirtilmemiş'}</p>
                      
                      {/* Overall Score */}
                      <div className="mt-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-slate-100 text-slate-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          <Star className="w-4 h-4" />
                          <span className="font-bold text-lg">{user.overallAverage?.toFixed(1) || '0'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                        <div className="flex items-center justify-center mb-2">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-blue-600 font-medium mb-1">Toplam Gol</p>
                        <p className="text-2xl font-bold text-blue-800">{user.toplamGol || 0}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                        <div className="flex items-center justify-center mb-2">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Toplam Asist</p>
                        <p className="text-2xl font-bold text-purple-800">{user.toplamAsist || 0}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl text-center border border-emerald-200 col-span-2">
                        <p className="text-xs text-emerald-600 font-medium mb-1">Toplam Değerlendirme</p>
                        <p className="text-xl font-bold text-emerald-800">
                          {user.puanlar ? Object.values(user.puanlar).reduce((acc, curr) => acc + (curr.count || 0), 0) : 0} oy
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest of the Rankings */}
        {users.length > 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              Diğer Sıralamalar
            </h2>
            
            <div className="space-y-4">
              {users.slice(3).map((user, index) => (
                <div 
                  key={user.id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-emerald-200 group"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-6">
                      
                      {/* Rank Number */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center border-2 border-slate-300 group-hover:border-emerald-300 transition-colors">
                          <span className="font-bold text-slate-700 text-lg">{index + 4}</span>
                        </div>
                      </div>

                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        <img
                          src={user.photoURL || '/default-avatar.png'}
                          alt={user.name}
                          className="w-14 h-14 rounded-full border-3 border-white shadow-md group-hover:shadow-lg transition-shadow"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>')}`;
                          }}
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-slate-800 truncate">{user.name}</h3>
                        <p className="text-slate-500 font-medium">{user.anaMevki || 'Mevki belirtilmemiş'}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-emerald-500" />
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Puan</p>
                          <p className="text-lg font-bold text-slate-800">{user.overallAverage?.toFixed(1) || '0'}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="w-4 h-4 text-blue-500" />
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Gol</p>
                          <p className="text-lg font-bold text-slate-800">{user.toplamGol || 0}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Zap className="w-4 h-4 text-purple-500" />
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Asist</p>
                          <p className="text-lg font-bold text-slate-800">{user.toplamAsist || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Henüz veri bulunamadı</h3>
            <p className="text-slate-500">Oyuncular puanlandırıldıkça burada görünecek</p>
          </div>
        )}
      </div>
    </div>
  );
}