'use client';

import { useState, useEffect } from 'react';
import { User, Trophy, Target, MapPin, CreditCard, Star } from 'lucide-react';
import { db, auth } from '../../utils/firebase';
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ToplaGel() {
    const [isVisible, setIsVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [collector, setCollector] = useState(null);
    const [collectorLoading, setCollectorLoading] = useState(true);
    const [showIbanModal, setShowIbanModal] = useState(false);
    const [ibanInput, setIbanInput] = useState('');
    const [ibanError, setIbanError] = useState(null);
    const router = useRouter();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAnaMevki, setEditAnaMevki] = useState('');
    const [editIban, setEditIban] = useState('');
    const [showVotingModal, setShowVotingModal] = useState(false);
    const [participationStatus, setParticipationStatus] = useState('');
    const [plusOnes, setPlusOnes] = useState([]);
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [userVote, setUserVote] = useState(null);
    const [votes, setVotes] = useState([]);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    const handleVote = async (status, extraParticipants = []) => {
        try {
            const voteRef = doc(db, 'votes', currentUser.uid);
            const voteData = {
                userId: currentUser.uid,
                userName: userData.name,
                status,
                extraParticipants,
                timestamp: new Date().toISOString()
            };

            await setDoc(voteRef, voteData);
            setUserVote(voteData);
            setShowVotingModal(false);
            fetchVotes();
        } catch (error) {
            console.error("Oy verme hatası:", error);
        }
    };
    const fetchAllUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const usersSnap = await getDocs(usersRef);
            const usersData = usersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllUsers(usersData);
        } catch (error) {
            console.error("Kullanıcıları çekme hatası:", error);
        }
    };
    // Add this function to fetch all votes
    const fetchVotes = async () => {
        try {
            const votesRef = collection(db, 'votes');
            const votesSnap = await getDocs(votesRef);
            const votesData = votesSnap.docs.map(doc => doc.data());

            setVotes(votesData);

            // Calculate total participants
            let count = 0;
            votesData.forEach(vote => {
                if (vote.status === 'Kesin Geleceğim') count += 1;
                if (vote.status === 'Yanımda +1 var') count += 2;
                if (vote.status === 'Yanımda +2 var') count += 3;
                if (vote.status === 'Yanımda +3 var') count += 4;
            });

            setTotalParticipants(count);
        } catch (error) {
            console.error("Oyları çekme hatası:", error);
        }
    };

    // Call fetchVotes in your useEffect when user is authenticated
    // Add this inside your useEffect where you fetch other data:

    // Calculate time until next Tuesday 20:15
    const calculateTimeLeft = () => {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();

        let daysUntilTuesday = (2 - currentDay + 7) % 7;
        if (daysUntilTuesday === 0 && (currentHours > 20 || (currentHours === 20 && currentMinutes >= 15))) {
            daysUntilTuesday = 7;
        }

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTuesday);
        targetDate.setHours(20, 15, 0, 0);

        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        } else {
            resetCollector();
        }
    };

    // Fetch collector data
    const fetchCollector = async () => {
        try {
            setCollectorLoading(true);
            const collectorRef = doc(db, 'paraToplayici', 'currentCollector');
            const collectorSnap = await getDoc(collectorRef);

            if (collectorSnap.exists()) {
                setCollector(collectorSnap.data());
            } else {
                setCollector(null);
            }
        } catch (err) {
            console.error('Para toplayıcı çekme hatası:', err);
            setError('Para toplayıcı verisi çekilirken hata oluştu: ' + err.message);
        } finally {
            setCollectorLoading(false);
        }
    };

    // Reset collector
    const resetCollector = async () => {
        try {
            await deleteDoc(doc(db, 'paraToplayici', 'currentCollector'));
            // Clear all votes
            const votesRef = collection(db, 'votes');
            const votesSnap = await getDocs(votesRef);
            votesSnap.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            setCollector(null);
            setVotes([]);
            setTotalParticipants(0);
        } catch (err) {
            console.error('Para toplayıcı sıfırlama hatası:', err);
            setError('Para toplayıcı sıfırlanırken hata oluştu: ' + err.message);
        }
    };

    // Select random user as collector
    const selectRandomCollector = async () => {
        try {
            const usersRef = collection(db, 'users');
            const usersSnap = await getDocs(usersRef);
            const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (users.length === 0) {
                setError('Kullanıcı bulunamadı!');
                return;
            }

            const randomIndex = Math.floor(Math.random() * users.length);
            const selectedUser = users[randomIndex];

            const collectorData = {
                userId: selectedUser.id,
                name: selectedUser.name || 'Bilinmeyen Kullanıcı',
                iban: selectedUser.iban || 'Bilinmeyen İban',
                email: selectedUser.email || '',
                timestamp: new Date().toISOString()
            };

            await setDoc(doc(db, 'paraToplayici', 'currentCollector'), collectorData);
            setCollector(collectorData);
        } catch (err) {
            console.error('Rastgele kullanıcı seçme hatası:', err);
            setError('Rastgele kullanıcı seçilirken hata oluştu: ' + err.message);
        }
    };

    // Validate and save IBAN
    const handleIbanSubmit = async () => {
        // Basic Turkish IBAN validation (TR + 24 characters, starting with TR and 2 digits)
        const ibanRegex = /^TR[0-9]{2}[0-9A-Z]{22}$/;
        if (!ibanRegex.test(ibanInput)) {
            setIbanError('Geçerli bir TR IBAN giriniz (TR ile başlamalı, 26 karakter olmalı)');
            return;
        }

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { iban: ibanInput });
            setUserData(prev => ({ ...prev, iban: ibanInput }));
            setShowIbanModal(false);
            setIbanInput('');
            setIbanError(null);
        } catch (err) {
            console.error('IBAN kaydetme hatası:', err);
            setIbanError('IBAN kaydedilirken hata oluştu: ' + err.message);
        }
    };

    useEffect(() => {
        setIsVisible(true);

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        const interval = setInterval(() => {
            setBallPosition(prev => ({
                x: 30 + Math.sin(Date.now() / 2000) * 20,
                y: 40 + Math.cos(Date.now() / 3000) * 10
            }));
        }, 100);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchUserData(user.uid);
                fetchCollector();
                fetchVotes();
                fetchAllUsers();
            } else {
                router.push('/');
            }
        });

        const fetchUserData = async (userId) => {
            try {
                setLoading(true);
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        name: data.name || currentUser?.displayName || 'İsim bulunamadı',
                        email: data.email || currentUser?.email || 'Email bulunamadı',
                        photoURL: data.photoURL || currentUser?.photoURL || '',
                        toplamGol: data.toplamGol || 0,
                        toplamAsist: data.toplamAsist || 0,
                        anaMevki: data.anaMevki || 'Belirtilmemiş',
                        average: data.average || 0,
                        iban: data.iban || '',
                        puanlar: {
                            'Kaleci': data.puanlar?.Kaleci || 0,
                            'Defans': data.puanlar?.Defans || 0,
                            'Orta Saha': data.puanlar?.OrtaSaha || 0,
                            'Forvet': data.puanlar?.Forvet || 0,
                            'Kanat': data.puanlar?.Kanat || 0,
                            'Bek': data.puanlar?.Bek || 0
                        }
                    });
                    setError(null);
                } else {
                    setError('Kullanıcı verisi bulunamadı! Firestore\'da kullanıcı kaydı oluşturulmamış olabilir.');
                }
            } catch (err) {
                console.error('Firestore hatası:', err);
                setError('Veri çekme hatası: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        return () => {
            clearInterval(interval);
            clearInterval(timer);
            unsubscribe();
        };
    }, [router]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    };

    if (loading || collectorLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-emerald-600">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-400 via-green-500 to-emerald-600">
            <div className="relative z-10 min-h-screen py-8 px-4">
                <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className={`${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-700 delay-300`}>


                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                <p className="font-semibold">Hata:</p>
                                <p>{error}</p>
                                {currentUser && (
                                    <p className="mt-2 text-sm">Kullanıcı ID: {currentUser.uid}</p>
                                )}
                            </div>
                        )}

                        {userData && (
                            <>
                                <div className="bg-white rounded-2xl shadow-2xl p-7 mb-8 backdrop-blur-sm bg-opacity-95">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="relative">
                                            <img
                                                src={userData.photoURL || '/default-avatar.png'}
                                                alt="Profil resmi"
                                                className="w-24 h-24 rounded-full shadow-lg border-4 border-green-200"
                                                onError={(e) => {
                                                    e.target.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>')}`;
                                                }}
                                            />

                                        </div>
                                        <div className="text-center md:text-left flex-1">
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <h2 className="text-3xl font-bold text-gray-800 mb-2">{userData.name}</h2>
                                                <button
                                                    onClick={() => {
                                                        setEditName(userData.name);
                                                        setEditAnaMevki(userData.anaMevki);
                                                        setEditIban(userData.iban || '');
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                                                    aria-label="Düzenle"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="text-gray-600 mb-3 flex items-center justify-center md:justify-start gap-2">
                                                <MapPin size={16} />
                                                {userData.email}
                                            </p>
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                                                    Ana Mevki : {userData.anaMevki || 'Belirtilmemiş'}
                                                </div>
                                                <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                                                    <Star size={14} />
                                                    Ortalama : {userData.average} Puan
                                                </div>
                                            </div>
                                     
                                        </div>
                                    </div>
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">Toplam Gol</p>
                                                <p className="text-2xl font-bold text-gray-800">{userData.toplamGol}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                                                <Target size={24} />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">Toplam Asist</p>
                                                <p className="text-2xl font-bold text-gray-800">{userData.toplamAsist}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 backdrop-blur-sm bg-opacity-95">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <Star className="text-yellow-500" size={28} />
                                        Mevki Puanları
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(userData.puanlar).map(([position, score]) => (
                                            <div key={position} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-gray-700">{position}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${score >= 8 ? 'bg-green-500' :
                                                            score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}></div>
                                                        <span className="text-lg font-bold text-gray-800">{score}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${score >= 8 ? 'bg-green-500' :
                                                                score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.min((score / 10) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={handleLogout}
                                        className="group bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg flex items-center gap-3 mx-auto"
                                    >

                                        Çıkış Yap

                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={`${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-700 delay-300 space-y-6`}>
                        <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Sonraki Maç</h2>

                            <div className="text-center mb-4">
                                <p className="text-gray-600 text-sm mb-3">Salı 20:15'e kalan süre:</p>

                                <div className="grid grid-cols-4 gap-2">
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <div className="text-xl font-bold text-green-700">{timeLeft.days}</div>
                                        <div className="text-xs text-gray-600">Gün</div>
                                    </div>
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <div className="text-xl font-bold text-green-700">{timeLeft.hours}</div>
                                        <div className="text-xs text-gray-600">Saat</div>
                                    </div>
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <div className="text-xl font-bold text-green-700">{timeLeft.minutes}</div>
                                        <div className="text-xs text-gray-600">Dakika</div>
                                    </div>
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <div className="text-xl font-bold text-green-700">{timeLeft.seconds}</div>
                                        <div className="text-xs text-gray-600">Saniye</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-sm font-medium text-blue-800">Sonraki Maç</p>
                                <p className="text-sm text-blue-700">
                                    {(() => {
                                        const now = new Date();
                                        const currentDay = now.getDay();
                                        let daysUntilTuesday = (2 - currentDay + 7) % 7;
                                        if (daysUntilTuesday === 0 && (now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() >= 15))) {
                                            daysUntilTuesday = 7;
                                        }
                                        const targetDate = new Date(now);
                                        targetDate.setDate(now.getDate() + daysUntilTuesday);
                                        targetDate.setHours(20, 15, 0, 0);

                                        return targetDate.toLocaleDateString('tr-TR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                    })()}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 min-h-[200px]">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Katılım Durumu</h3>

                                <div className="mb-4 flex justify-between items-center">
                                    <p className="text-lg text-blue font-semibold">
                                        Toplam Katılımcı: <span className="text-black">{totalParticipants}/14</span>
                                    </p>
                                    <button
                                        onClick={() => setShowParticipantsModal(true)}
                                        className="bg-green-500 text-white px-3 py-1 rounded-lg transition"
                                    >
                                        Tüm Liste
                                    </button>
                                </div>

                                {userVote ? (
                                    <div className="space-y-3">
                                        <p className="text-gray-700">
                                            Sizin oyunuz: <span className="font-semibold">{userVote.status}</span>
                                            {userVote.extraParticipants.length > 0 && (
                                                <span> ({userVote.extraParticipants.join(', ')})</span>
                                            )}
                                        </p>
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => setShowVotingModal(true)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                            >
                                                Oyunu Değiştir
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await deleteDoc(doc(db, 'votes', currentUser.uid));
                                                    setUserVote(null);
                                                    fetchVotes();
                                                }}
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                            >
                                                Oyunu İptal Et
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowVotingModal(true)}
                                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                                    >
                                        Katılım Durumunu Belirt
                                    </button>
                                )}

                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 min-h-[200px] flex items-center justify-center">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Para Toplayıcı</h3>
                                {collector ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <User size={24} className="text-green-600" />
                                            <div>
                                                <p className="text-lg font-semibold text-gray-800">{collector.name}</p>
                                                <div className="flex items-center">
                                                    <p className="text-sm text-gray-600">{collector.iban}</p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(collector.iban);
                                                            // Optional: Add some feedback that text was copied
                                                        }}
                                                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                        aria-label="Copy IBAN"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Seçilme tarihi: {new Date(collector.timestamp).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-600">Henüz para toplayıcı belirlenmedi.</p>
                                        <button
                                            onClick={selectRandomCollector}
                                            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 font-semibold"
                                        >
                                            Rastgele Para Toplayıcı Seç
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Participants Modal */}
            {showParticipantsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Katılımcı Listesi</h3>
                            <button
                                onClick={() => setShowParticipantsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {votes.map((vote, index) => (
                                <div key={index} className="border-b pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center">
                                        <p className="text-black font-medium">{vote.userName}</p>
                                        <span className={`text-black px-2 py-1 rounded-full text-xs ${vote.status === 'Kesin Geleceğim' ? 'bg-green-100 text-green-800' :
                                                vote.status === 'Kesin Gelmeyeceğim' ? 'bg-red-100 text-red-800' :
                                                    vote.status === 'Belli Değil' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                            }`}>
                                            {vote.status}
                                        </span>
                                    </div>

                                    {vote.extraParticipants.length > 0 && (
                                        <div className="mt-2 pl-4">
                                            <p className="text-black text-sm text-gray-600">+{vote.extraParticipants.length}:</p>
                                            <ul className="text-black list-disc pl-5 text-sm text-gray-600">
                                                {vote.extraParticipants.map((name, i) => (
                                                    <li key={i}>{name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Show user's position */}
                                    {allUsers.find(u => u.id === vote.userId)?.anaMevki && (
                                        <div className="mt-1">
                                            <span className="text-black text-xs bg-gray-100 px-2 py-1 rounded">
                                                {allUsers.find(u => u.id === vote.userId)?.anaMevki}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {votes.length === 0 && (
                                <p className="text-gray-500 text-center py-4">Henüz katılımcı yok</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* IBAN Input Modal */}
            {showIbanModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <CreditCard size={24} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">IBAN Bilgisi Ekle</h3>
                            <p className="text-gray-600 text-sm">Ödeme almak için IBAN bilginizi girin</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={ibanInput}
                                    onChange={(e) => setIbanInput(e.target.value.toUpperCase())}
                                    placeholder="TRXXXXXXXXXXXXXXXXXXXXXXXX"
                                    className="text-black w-full p-4 border-2 border-gray-200 rounded-xl text-center font-mono text-lg tracking-wider focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white"
                                    maxLength="26"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {ibanInput.length === 26 && (
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 text-center">
                                <span className="bg-gray-100 px-2 py-1 rounded">TR</span> ile başlamalı, toplam 26 karakter olmalı
                            </div>

                            {ibanError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-600 text-sm flex items-center gap-2">
                                        <span className="text-red-500">⚠</span>
                                        {ibanError}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setShowIbanModal(false);
                                    setIbanInput('');
                                    setIbanError(null);
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold transform hover:scale-[0.98] active:scale-95"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleIbanSubmit}
                                disabled={ibanInput.length !== 26}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                💾 Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Profil Bilgilerini Düzenle</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ana Mevki</label>
                                <select
                                    value={editAnaMevki}
                                    onChange={(e) => setEditAnaMevki(e.target.value)}
                                    className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="Kaleci">Kaleci</option>
                                    <option value="Defans">Defans</option>
                                    <option value="Orta Saha">Orta Saha</option>
                                    <option value="Forvet">Forvet</option>
                                    <option value="Kanat">Kanat</option>
                                    <option value="Bek">Bek</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                                <input
                                    type="text"
                                    value={editIban}
                                    onChange={(e) => setEditIban(e.target.value.toUpperCase())}
                                    placeholder="TRXXXXXXXXXXXXXXXXXXXXXXXX"
                                    className="text-black  w-full p-3 border border-gray-300 rounded-lg font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    maxLength="26"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="bg-gray-100 px-2 py-1 rounded">TR</span> ile başlamalı, toplam 26 karakter olmalı
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                            >
                                İptal
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const userRef = doc(db, 'users', currentUser.uid);
                                        await updateDoc(userRef, {
                                            name: editName,
                                            anaMevki: editAnaMevki,
                                            iban: editIban
                                        });

                                        setUserData(prev => ({
                                            ...prev,
                                            name: editName,
                                            anaMevki: editAnaMevki,
                                            iban: editIban
                                        }));

                                        setShowEditModal(false);
                                    } catch (error) {
                                        console.error("Profil güncelleme hatası:", error);
                                    }
                                }}
                                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Voting Modal */}
            {showVotingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto my-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Katılım Durumunuz</h3>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setParticipationStatus('Kesin Geleceğim');
                                    setPlusOnes([]);
                                }}
                                className={`text-black w-full p-3 rounded-lg border-2 ${participationStatus === 'Kesin Geleceğim' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                            >
                                Kesin Geleceğim
                            </button>

                            <button
                                onClick={() => {
                                    setParticipationStatus('Kesin Gelmeyeceğim');
                                    setPlusOnes([]);
                                }}
                                className={`text-black w-full p-3 rounded-lg border-2 ${participationStatus === 'Kesin Gelmeyeceğim' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                                Kesin Gelmeyeceğim
                            </button>

                            <button
                                onClick={() => {
                                    setParticipationStatus('Belli Değil');
                                    setPlusOnes([]);
                                }}
                                className={`text-black w-full p-3 rounded-lg border-2 ${participationStatus === 'Belli Değil' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}
                            >
                                Belli Değil
                            </button>

                            <button
                                onClick={() => {
                                    setParticipationStatus('Yanımda +1 var');
                                    setPlusOnes(['']);
                                }}
                                className={`text-black w-full p-3 rounded-lg border-2 ${participationStatus === 'Yanımda +1 var' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                Yanımda +1 var
                            </button>

                            {participationStatus === 'Yanımda +1 var' && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">+1 İsmi</label>
                                    <input
                                        type="text"
                                        value={plusOnes[0] || ''}
                                        onChange={(e) => setPlusOnes([e.target.value])}
                                        className="text-black w-full p-2 border border-gray-300 rounded"
                                        placeholder="+1 kişinin ismini girin"
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setParticipationStatus('Yanımda +2 var');
                                    setPlusOnes(['', '']);
                                }}
                                className={`text-black w-full p-3 rounded-lg border-2 ${participationStatus === 'Yanımda +2 var' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                Yanımda +2 var
                            </button>

                            {participationStatus === 'Yanımda +2 var' && (
                                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Kişi İsmi</label>
                                        <input
                                            type="text"
                                            value={plusOnes[0] || ''}
                                            onChange={(e) => setPlusOnes([e.target.value, plusOnes[1]])}
                                            className="text-black w-full p-2 border border-gray-300 rounded"
                                            placeholder="1. kişinin ismini girin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Kişi İsmi</label>
                                        <input
                                            type="text"
                                            value={plusOnes[1] || ''}
                                            onChange={(e) => setPlusOnes([plusOnes[0], e.target.value])}
                                            className="text-black w-full p-2 border border-gray-300 rounded"
                                            placeholder="2. kişinin ismini girin"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setParticipationStatus('Yanımda +3 var');
                                    setPlusOnes(['', '', '']);
                                }}
                                className={`text-black w-full p-3 rounded-lg border-2 ${participationStatus === 'Yanımda +3 var' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                Yanımda +3 var
                            </button>

                            {participationStatus === 'Yanımda +3 var' && (
                                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Kişi İsmi</label>
                                        <input
                                            type="text"
                                            value={plusOnes[0] || ''}
                                            onChange={(e) => setPlusOnes([e.target.value, plusOnes[1], plusOnes[2]])}
                                            className="text-black w-full p-2 border border-gray-300 rounded"
                                            placeholder="1. kişinin ismini girin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Kişi İsmi</label>
                                        <input
                                            type="text"
                                            value={plusOnes[1] || ''}
                                            onChange={(e) => setPlusOnes([plusOnes[0], e.target.value, plusOnes[2]])}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            placeholder="2. kişinin ismini girin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">3. Kişi İsmi</label>
                                        <input
                                            type="text"
                                            value={plusOnes[2] || ''}
                                            onChange={(e) => setPlusOnes([plusOnes[0], plusOnes[1], e.target.value])}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            placeholder="3. kişinin ismini girin"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowVotingModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => {
                                    if (!participationStatus) return;

                                    // Validate plus ones if needed
                                    if (participationStatus.includes('+') && plusOnes.some(name => !name.trim())) {
                                        alert('Lütfen tüm ek kişilerin isimlerini girin');
                                        return;
                                    }

                                    handleVote(participationStatus, plusOnes.filter(name => name.trim()));
                                }}
                                disabled={!participationStatus}
                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}