'use client';

import { useEffect, useState } from 'react';

export default function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 md:max-w-md md:left-4">
      <p className="text-lg font-semibold mb-2">Instalar JR TRATORES</p>
      <p className="text-gray-600 mb-4">Instale nosso app para acesso rápido ao catálogo!</p>
      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Instalar
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
