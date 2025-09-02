import React, { useState, useCallback } from 'react';
import { MODELS, VIBES, VIDEO_LOADING_MESSAGES } from './constants';
import { Step, type ProductImage, type Model, type Vibe, type GeneratedContent } from './types';
import { generateImage, generateVideo } from './services/geminiService';

// Helper: Konverter File ke Base64
const fileToBase64 = (file: File): Promise<ProductImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error("Gagal membaca file sebagai base64"));
        return;
      }
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Komponen Anak didefinisikan di luar induk untuk mencegah render ulang ---

interface StepIndicatorProps {
  currentStep: Step;
}
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    const steps = ['Produk', 'Model', 'Vibe', 'Proses', 'Hasil'];
    const activeIndex = currentStep === Step.GENERATING ? 3 : currentStep === Step.SHOW_RESULTS ? 4 : currentStep;
    
    return (
        <nav className="flex items-center justify-center mb-8" aria-label="Progress">
            <ol role="list" className="flex items-center space-x-4">
                {steps.map((stepName, stepIdx) => (
                    <li key={stepName}>
                        <div className="flex items-center">
                            {stepIdx > 0 && <div className="w-8 h-px bg-gray-600"></div>}
                            <div className={`relative flex items-center justify-center ml-4 ${stepIdx <= activeIndex ? 'text-purple-400' : 'text-gray-500'}`}>
                                <span className={`absolute w-8 h-8 rounded-full ${stepIdx < activeIndex ? 'bg-purple-600' : stepIdx === activeIndex ? 'bg-purple-500 animate-pulse' : 'bg-gray-700'}`}></span>
                                <span className={`relative font-medium`}>{stepName}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};


interface FileUploadProps {
  onImageUpload: (image: ProductImage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
const FileUpload: React.FC<FileUploadProps> = ({ onImageUpload, setLoading, setError }) => {
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setLoading(true);
            try {
                const image = await fileToBase64(file);
                onImageUpload(image);
            } catch (err) {
                setError('Tidak dapat memproses file. Silakan coba gambar lain.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Langkah 1: Unggah Gambar Produk Anda</h2>
            <p className="text-gray-400 mb-8">Mari kita mulai dengan menunjukkan apa yang ingin Anda promosikan.</p>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10 bg-gray-800/50">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    <div className="mt-4 flex text-sm leading-6 text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-purple-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-purple-300">
                            <span>Unggah file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">atau seret dan lepas</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-500">PNG, JPG hingga 10MB</p>
                </div>
            </div>
        </div>
    );
};

interface ModelSelectorProps {
    models: Model[];
    onSelect: (model: Model) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}
const ModelSelector: React.FC<ModelSelectorProps> = ({ models, onSelect, searchQuery, onSearchChange }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Langkah 2: Pilih Model Virtual Anda</h2>
        <p className="text-gray-400 mb-8 text-center">Pilih model yang paling sesuai dengan kepribadian merek Anda.</p>
        
        <div className="mb-6">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari model berdasarkan nama..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                aria-label="Cari Model"
            />
        </div>

        {models.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {models.map(model => (
                    <div key={model.id} onClick={() => onSelect(model)} className="cursor-pointer group relative rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform duration-300">
                        <img src={model.imageUrl} alt={model.name} className="w-full h-64 object-cover group-hover:opacity-75 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-lg font-bold text-white">{model.name}</h3>
                            <p className="text-sm text-gray-300">{model.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <p className="text-center text-gray-400 mt-4">Tidak ada model yang cocok dengan pencarian Anda.</p>
        )}
    </div>
);

interface VibeSelectorProps {
    onSelect: (vibe: Vibe) => void;
}
const VibeSelector: React.FC<VibeSelectorProps> = ({ onSelect }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Langkah 3: Pilih Suasana Konten Anda</h2>
        <p className="text-gray-400 mb-8 text-center">Bagaimana suasananya? Pilih gaya untuk konten Anda.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VIBES.map(vibe => (
                <button key={vibe.id} onClick={() => onSelect(vibe)} className="text-left p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-purple-900/50 hover:border-purple-600 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-white">{vibe.name}</h3>
                    <p className="text-gray-400 mt-1">{vibe.description}</p>
                </button>
            ))}
        </div>
    </div>
);

interface GenerationScreenProps {
    loadingMessage: string;
}
const GenerationScreen: React.FC<GenerationScreenProps> = ({ loadingMessage }) => (
    <div className="text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-4">Menghasilkan Konten Anda...</h2>
        <p className="text-gray-400 max-w-md">{loadingMessage}</p>
    </div>
);

interface ResultsDisplayProps {
    content: GeneratedContent;
    onStartOver: () => void;
}
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ content, onStartOver }) => {
    const handleDownloadImage = () => {
        if (!content.image) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${content.image}`;
        link.download = 'gambar-promosi-tiktok.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const DownloadIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Konten TikTok Anda Sudah Siap!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-4">Gambar yang Dihasilkan</h3>
                    <div className="flex-grow">
                        {content.image && <img src={`data:image/png;base64,${content.image}`} alt="Konten promosi yang dihasilkan" className="rounded-lg w-full object-contain" />}
                    </div>
                     {content.image && (
                        <button onClick={handleDownloadImage} className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300">
                            <DownloadIcon />
                            Unduh Gambar
                        </button>
                    )}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-4">Video yang Dihasilkan</h3>
                    <div className="flex-grow">
                        {content.videoUrl && <video src={content.videoUrl} controls autoPlay loop className="rounded-lg w-full object-contain" />}
                    </div>
                     {content.videoUrl && (
                        <a href={content.videoUrl} download="video-promosi-tiktok.mp4" className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300">
                            <DownloadIcon />
                            Unduh Video
                        </a>
                    )}
                </div>
            </div>
             <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Saran Caption</h3>
                <p className="text-gray-300 italic">"{content.caption}"</p>
            </div>
            <button onClick={onStartOver} className="mt-8 px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-300">
                Buat Lagi
            </button>
        </div>
    );
};


// --- Komponen Aplikasi Utama ---

const App: React.FC = () => {
    const [step, setStep] = useState<Step>(Step.UPLOAD_PRODUCT);
    const [productImage, setProductImage] = useState<ProductImage | null>(null);
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({ image: null, videoUrl: null, caption: null });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [modelSearchQuery, setModelSearchQuery] = useState('');

    const handleImageUpload = (image: ProductImage) => {
        setProductImage(image);
        setStep(Step.SELECT_MODEL);
    };

    const handleModelSelect = (model: Model) => {
        setSelectedModel(model);
        setStep(Step.SELECT_VIBE);
    };

    const handleGenerateContent = useCallback(async (vibe: Vibe) => {
        setSelectedVibe(vibe);
        setStep(Step.GENERATING);
        setIsLoading(true);
        setError(null);

        if (!productImage || !selectedModel) {
            setError("Gambar produk atau model yang dipilih tidak ada.");
            setStep(Step.UPLOAD_PRODUCT);
            setIsLoading(false);
            return;
        }

        try {
            setLoadingMessage("Menghasilkan gambar promosi...");
            const { image: newImage, caption } = await generateImage(productImage, selectedModel, vibe);
            setGeneratedContent(prev => ({ ...prev, image: newImage, caption }));
            
            let messageIndex = 0;
            const updateLoadingMessage = (customMessage?: string) => {
                if(customMessage) {
                    setLoadingMessage(customMessage);
                } else {
                    setLoadingMessage(VIDEO_LOADING_MESSAGES[messageIndex]);
                    messageIndex = (messageIndex + 1) % VIDEO_LOADING_MESSAGES.length;
                }
            };
            
            updateLoadingMessage("Gambar berhasil dibuat! Memulai pembuatan video...");
            
            const newVideoUrl = await generateVideo(newImage, vibe, updateLoadingMessage);
            setGeneratedContent(prev => ({ ...prev, videoUrl: newVideoUrl }));

            setStep(Step.SHOW_RESULTS);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan yang tidak diketahui saat pembuatan konten.');
            setStep(Step.UPLOAD_PRODUCT); // Kembali ke awal
        } finally {
            setIsLoading(false);
        }
    }, [productImage, selectedModel]);


    const handleStartOver = () => {
        setStep(Step.UPLOAD_PRODUCT);
        setProductImage(null);
        setSelectedModel(null);
        setSelectedVibe(null);
        setGeneratedContent({ image: null, videoUrl: null, caption: null });
        setError(null);
        setModelSearchQuery('');
    };
    
    const filteredModels = MODELS.filter(model =>
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
    );

    const renderContent = () => {
        switch (step) {
            case Step.UPLOAD_PRODUCT:
                return <FileUpload onImageUpload={handleImageUpload} setLoading={setIsLoading} setError={setError} />;
            case Step.SELECT_MODEL:
                return <ModelSelector models={filteredModels} onSelect={handleModelSelect} searchQuery={modelSearchQuery} onSearchChange={setModelSearchQuery} />;
            case Step.SELECT_VIBE:
                return <VibeSelector onSelect={handleGenerateContent} />;
            case Step.GENERATING:
                return <GenerationScreen loadingMessage={loadingMessage} />;
            case Step.SHOW_RESULTS:
                return <ResultsDisplay content={generatedContent} onStartOver={handleStartOver} />;
            default:
                return <p>Status tidak valid</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                        Generator Konten TikTok <span className="text-purple-500">AI</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Buat konten pemasaran afiliasi yang menakjubkan dalam hitungan menit.
                    </p>
                </header>

                <main className="bg-gray-800/50 rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-700">
                    {step !== Step.GENERATING && step !== Step.SHOW_RESULTS && <StepIndicator currentStep={step} />}
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-center">{error}</div>}
                    {isLoading && step !== Step.GENERATING && <div className="text-center my-4"><div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-purple-400 mx-auto"></div></div>}
                    <div className="transition-opacity duration-500 ease-in-out">
                        {renderContent()}
                    </div>
                </main>

                 <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>Didukung oleh Google Gemini. Hanya untuk tujuan promosi dan demonstrasi.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
