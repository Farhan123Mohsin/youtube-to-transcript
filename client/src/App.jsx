import { useState } from 'react'
import './App.css'

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [videoMetadata, setVideoMetadata] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [includeTimestamps, setIncludeTimestamps] = useState(false)
  const [timestampedTranscript, setTimestampedTranscript] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!youtubeUrl) {
      setError('Please enter a YouTube URL')
      return
    }

    setIsLoading(true)
    setError('')
    setTranscript('')
    setVideoInfo(null)
    setVideoMetadata(null)
    setCopySuccess(false)

    try {
      const response = await fetch("http://127.0.0.1:5000/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
                body: JSON.stringify({
          youtubeUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setTranscript(data.transcript);
      setTimestampedTranscript(data.timestamped_transcript || '');
      setVideoInfo({
        videoId: data.video_id,
        language: data.language,
        languageCode: data.language_code,
        isGenerated: data.is_generated
      });
      setVideoMetadata(data.video_metadata || null);
    } catch (err) {
      console.error('Error details:', err);
      setError(`Failed to fetch transcript: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const textToCopy = includeTimestamps && timestampedTranscript ? timestampedTranscript : transcript
      await navigator.clipboard.writeText(textToCopy)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadTranscript = () => {
    const textToDownload = includeTimestamps && timestampedTranscript ? timestampedTranscript : transcript
    if (!textToDownload) {
      return
    }

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const fileSuffix = includeTimestamps && timestampedTranscript ? 'with-timestamps' : 'plain'
    const fileName = `youtube-transcript-${videoInfo?.videoId || 'transcript'}-${fileSuffix}.txt`

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YouTubeToTranscript.io
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
              <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4">
        {/* Hero Section with SEO-rich content */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Generate YouTube Transcripts for FREE! 🚀
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Access all transcript languages, translate to 125+ languages, easy copy and edit! 
            Perfect for content creators, researchers, and note-takers.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              ✅ One-click Copy
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🌍 Supports Translation
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              🗣️ Multiple Languages
            </span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
              🤖 AI-Powered
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* URL Input Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !youtubeUrl}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">Generating Transcript...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Generate Transcript
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata Display */}
          {videoMetadata && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8 animate-fade-in video-metadata">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Video Thumbnail */}
                {videoMetadata.thumbnail_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={videoMetadata.thumbnail_url} 
                      alt={videoMetadata.title}
                      className="w-full md:w-48 h-32 md:h-36 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                )}
                
                {/* Video Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {videoMetadata.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{videoMetadata.author_name}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      YouTube Video
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      ID: {videoInfo?.videoId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Transcript Display */}
          {transcript && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">Transcript</h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Timestamp Toggle Button */}
                  <button
                    onClick={() => setIncludeTimestamps(!includeTimestamps)}
                    className={`font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center ${
                      includeTimestamps 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {includeTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
                  </button>
                  
                  {/* Copy Button */}
                  <button
                    onClick={copyToClipboard}
                    className={`font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center ${
                      copySuccess 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                  {/* Download Button */}
                  <button
                    onClick={downloadTranscript}
                    disabled={!transcript}
                    className={`font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center ${
                      transcript
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200 transcript-scroll">
                <pre className={`whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm ${includeTimestamps && timestampedTranscript ? 'timestamped-transcript' : ''}`}>
                  {includeTimestamps && timestampedTranscript ? timestampedTranscript : transcript}
                </pre>
              </div>
            </div>
          )}
        </div>

          {/* How It Works Section */}
          <section id="how-it-works" className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How to Generate a YouTube Transcript 🎥</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">1</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Paste YouTube URL</h3>
                <p className="text-gray-600">Simply paste your YouTube video link and click "Get Transcript"</p>
              </div>
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">2</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Customize & Translate</h3>
                <p className="text-gray-600">Select your preferred language and translate to 125+ languages</p>
              </div>
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">3</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Copy & Use</h3>
                <p className="text-gray-600">Copy with one click and use with AI tools for summaries, notes, and more</p>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why You Need YouTube Transcripts? 🤔</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-3xl mr-3">📝</span>
                  For Note Takers
                </h3>
                <p className="text-gray-600 mb-4">
                  It can be challenging to follow along with a video while taking notes. With the transcript, you can easily copy and paste the text into your notes.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Paste the YouTube transcript into ChatGPT for quick note generation</li>
                  <li>• Get podcast transcripts uploaded on YouTube</li>
                  <li>• Translate transcripts to your native language</li>
                  <li>• Click on any line to jump to that part in the video</li>
                </ul>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-3xl mr-3">🎬</span>
                  For Content Creators
                </h3>
                <p className="text-gray-600 mb-4">
                  Content creators can use this tool to research and create content effortlessly. Simply add your YouTube video URL and get the transcript.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Create quizzes, memes, and infographics from transcripts</li>
                  <li>• Summarize transcripts for better SEO rankings</li>
                  <li>• Extract key points for social media posts</li>
                  <li>• Use as foundation for blog posts and articles</li>
                </ul>
              </div>
            </div>
          </section>

          {/* AI Integration Section */}
          <section className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Pair YouTube Transcripts with AI Tools 🤖</h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <p className="text-lg text-gray-600 mb-6 text-center">
                Using AI to learn, create content, and take notes is the future. You can use the transcript with other AI tools to generate summaries, notes, or even generate new content.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Some Ideas to use with AI tools:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Generate notes and summaries</li>
                    <li>• Extract key points and quotes</li>
                    <li>• Create quizzes and trivia</li>
                    <li>• Generate questions and answers</li>
                    <li>• Create memes and infographics</li>
                    <li>• Find more information about topics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Perfect for:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Students and researchers</li>
                    <li>• Content creators and marketers</li>
                    <li>• Podcasters and YouTubers</li>
                    <li>• Language learners</li>
                    <li>• Accessibility needs</li>
                    <li>• Social media managers</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose YouTubeToTranscript.io?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The most advanced YouTube transcript generator with enterprise-grade features
              </p>
            </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h4>
              <p className="text-gray-600">Get transcripts in seconds, not minutes. Optimized for speed and performance.</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Highly Accurate</h4>
              <p className="text-gray-600">Powered by YouTube's own transcript data with 50+ language support.</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h4>
              <p className="text-gray-600">Your data is safe and never stored. Privacy-first approach.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mt-20 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is YouTubeToTranscript.io free to use?</h3>
              <p className="text-gray-600">Yes, YouTubeToTranscript.io is completely free to use. You can easily extract subtitles/transcripts generated by YouTube from YouTube videos without any cost or registration required.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How many languages does YouTubeToTranscript.io support?</h3>
              <p className="text-gray-600">YouTubeToTranscript.io supports 50+ languages for transcript generation and can translate transcripts to over 125 languages, making it perfect for global content creators and researchers.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How long does it take to generate a YouTube transcript?</h3>
              <p className="text-gray-600">The transcript is generated almost instantly after you paste the YouTube video link and click 'Generate Transcript.' You'll have your transcript ready within seconds!</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I use YouTube transcripts with AI tools?</h3>
              <p className="text-gray-600">Absolutely! YouTubeToTranscript.io is perfect for use with AI tools like ChatGPT. You can generate summaries, notes, quizzes, and creative content from your transcripts.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a limit to the length of the video I can transcribe?</h3>
              <p className="text-gray-600">Currently, there are no limits on the length of the video you can transcribe. You can transcribe videos of any duration seamlessly.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I download the transcript?</h3>
              <p className="text-gray-600">Currently, we do not offer a download option for the transcript directly from our platform. However, you can easily copy the transcript and paste it into your preferred document or application for further use.</p>
            </div>
          </div>
        </section>
      </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    YouTubeToTranscript.io
                  </span>
                </div>
                <p className="text-gray-600 mb-4 max-w-md">
                  The most advanced YouTube transcript generator. Get instant, accurate transcripts in 50+ languages with enterprise-grade security.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
              <p>&copy; 2024 YouTubeToTranscript.io. All rights reserved. Built with ❤️ for content creators worldwide.</p>
            </div>
          </div>
        </footer>
    </div>
  )
}

export default App
