
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '../../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';

export default function LoginPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setIsVisible(true);

        // Ball animation
        const interval = setInterval(() => {
            setBallPosition(prev => ({
                x: 30 + Math.sin(Date.now() / 2000) * 20,
                y: 40 + Math.cos(Date.now() / 3000) * 10
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Google login handler
    const handleGoogleLogin = async () => {
        try {
            setError(null); // Clear any previous errors
            const result = await signInWithGoogle();
            const user = result.user;

            // Create or update user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                toplamGol: 0,
                toplamAsist: 0,
                puanlar: {
                    Forvet: 0,
                    OrtaSaha: 0,
                    Defans: 0,
                    Kaleci: 0,
                    Kanat: 0,
                    Bek: 0
                },
                anaMevki: '',
                average: 0, // Corrected typo from 'avarage'
                iban: ''
            }, { merge: true });

            // Redirect to /topla-gel
            router.push('/topla-gel');
        } catch (error) {
            console.error('Google ile giriş hatası:', error);
            setError('Giriş başarısız oldu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-400 via-green-500 to-green-600">
            {/* Halı saha zemin deseni */}
            <div className="absolute inset-0 opacity-30">
                <div className="w-full h-full relative">
                    {/* Saha çizgileri */}
                    <svg className="w-full h-full" viewBox="0 0 800 600">
                        <rect x="50" y="100" width="700" height="400" fill="none" stroke="white" strokeWidth="3" />
                        <line x1="400" y1="100" x2="400" y2="500" stroke="white" strokeWidth="2" />
                        <circle cx="400" cy="300" r="50" fill="none" stroke="white" strokeWidth="2" />
                        <rect x="50" y="200" width="80" height="200" fill="none" stroke="white" strokeWidth="2" />
                        <rect x="50" y="250" width="40" height="100" fill="none" stroke="white" strokeWidth="2" />
                        <rect x="670" y="200" width="80" height="200" fill="none" stroke="white" strokeWidth="2" />
                        <rect x="710" y="250" width="40" height="100" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M 50 100 Q 60 100 60 110" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M 750 100 Q 740 100 740 110" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M 50 500 Q 60 500 60 490" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M 750 500 Q 740 500 740 490" fill="none" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
            </div>

            {/* Animasyonlu futbol topu */}
            <div
                className="absolute w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out z-20"
                style={{
                    left: `${ballPosition.x}%`,
                    top: `${ballPosition.y}%`,
                    background: 'radial-gradient(circle at 30% 30%, #ffffff, #f0f0f0, #e0e0e0)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2)'
                }}
            >
                <div className="w-full h-full relative">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full"></div>
                    <div className="absolute bottom-1 left-2 w-1 h-1 bg-black rounded-full"></div>
                </div>
            </div>

       

            {/* Ana içerik */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <div
                    className={`p-8 text-center ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-700`}
                >
                    {/* Başlık */}
                    <h1 className="text-5xl font-black text-white mb-8 tracking-wider drop-shadow-lg">
                        <span className="text-green-200">TOPLA</span>{' '}
                        <span className="text-white">GEL</span>
                    </h1>

                    {/* Açıklama */}
                    <p className="text-xl text-white mb-10 leading-relaxed max-w-md mx-auto drop-shadow-md font-medium">
                        Google ile giriş yap ve halı saha maçlarını hemen organize et!
                    </p>

                    {/* Hata mesajı */}
                    {error && (
                        <p className="text-red-500 mb-4 font-medium">{error}</p>
                    )}

                    {/* Google ile Giriş Butonu */}
                    <button
                        onClick={handleGoogleLogin}
                        className="cursor-pointer group bg-white text-gray-800 px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg border-2 border-gray-200 border-opacity-20 hover:border-opacity-40 flex items-center justify-center gap-3 mx-auto"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 48 48">
                            <path
                                fill="#4285F4"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                                fill="#34A853"
                                d="M46.98 24.55c0-1.7-.15-3.33-.43-4.9H24v9.24h12.84c-.56 2.98-2.24 5.5-4.78 7.18l7.98 6.19c4.65-4.3 7.94-10.74 7.94-17.71z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                                fill="#EA4335"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.24 1.5-5.09 2.38-7.91 2.38-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                        </svg>
                        Google ile Giriş Yap
                    </button>
                </div>
            </div>

            {/* Köşelerde dekoratif elementler */}
            <div className="absolute top-10 left-10 w-16 h-16 border-4 border-white border-opacity-40 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-10 right-10 w-12 h-12 border-4 border-white border-opacity-40 rounded-full animate-bounce"></div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-20"></div>
        </div>
    );
}
