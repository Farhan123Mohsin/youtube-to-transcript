from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, VideoUnavailable
from flask_cors import CORS
import re
import requests
import json 

app = Flask(__name__)
CORS(app, origins=['https://youtubetotranscript.io', 'http://localhost:5173', 'http://127.0.0.1:5173'])

def extract_video_id(url):
    """Extract video ID from various YouTube URL formats"""
    # Regular expressions for different YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/v\/([a-zA-Z0-9_-]{11})',
        r'youtu\.be\/([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # If no pattern matches, try the old method as fallback
    if 'v=' in url:
        return url.split('v=')[-1].split('&')[0]
    
    raise ValueError('Invalid YouTube URL format')

def format_timestamp(seconds):
    """Convert seconds to MM:SS or HH:MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes:02d}:{seconds:02d}"

def get_video_metadata(video_id):
    """Fetch video metadata from YouTube"""
    try:
        # Use YouTube's oEmbed API to get basic video info
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(oembed_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'title': data.get('title', 'Unknown Title'),
                'author_name': data.get('author_name', 'Unknown Channel'),
                'thumbnail_url': data.get('thumbnail_url', ''),
                'provider_name': data.get('provider_name', 'YouTube'),
                'html': data.get('html', '')
            }
        else:
            return {
                'title': 'Video Title Unavailable',
                'author_name': 'Unknown Channel',
                'thumbnail_url': '',
                'provider_name': 'YouTube',
                'html': ''
            }
    except Exception as e:
        print(f"Error fetching video metadata: {str(e)}")
        return {
            'title': 'Video Title Unavailable',
            'author_name': 'Unknown Channel',
            'thumbnail_url': '',
            'provider_name': 'YouTube',
            'html': ''
        }

@app.route("/api/transcript", methods=["POST"])
def get_transcript():
    try:
        data = request.get_json()
        
        if not data or 'youtubeUrl' not in data:
            return jsonify({'error': 'YouTube URL is required'}), 400
        
        youtube_url = data['youtubeUrl']
        
        # Extract video ID from YouTube URL (supports multiple formats)
        try:
            video_id = extract_video_id(youtube_url)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Get video metadata
        video_metadata = get_video_metadata(video_id)
        
        # Get transcript using youtube-transcript-api
        ytt_api = YouTubeTranscriptApi()
        # Try multiple languages in order of preference
        try:
            # First try to get transcript in the video's original language
            transcript = ytt_api.fetch(video_id)
        except NoTranscriptFound:
            # If no transcript found, try common languages
            try:
                transcript = ytt_api.fetch(video_id, languages=[
                    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',  # Original languages
                    'hi', 'ar', 'bn', 'ur', 'ta', 'te', 'ml', 'kn', 'gu', 'pa',  # Indian languages
                    'th', 'vi', 'id', 'ms', 'tl', 'nl', 'sv', 'no', 'da', 'fi',  # Southeast Asian & Nordic
                    'pl', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'et', 'lv',  # Eastern European
                    'tr', 'fa', 'he', 'uk', 'be', 'ka', 'hy', 'az', 'kk', 'uz'   # Middle Eastern & Central Asian
                ])
            except NoTranscriptFound:
                # If still no transcript, try any available language
                transcript = ytt_api.fetch(video_id, languages=['en'])
        
        # Convert transcript to plain text
        transcript_text = " ".join([snippet.text for snippet in transcript])
        
        # Always generate timestamped transcript for real-time toggling
        timestamped_lines = []
        for snippet in transcript:
            timestamp = format_timestamp(snippet.start)
            timestamped_lines.append(f"[{timestamp}] {snippet.text}")
        timestamped_transcript = "\n".join(timestamped_lines)
        
        return jsonify({
            'success': True,
            'transcript': transcript_text,
            'timestamped_transcript': timestamped_transcript,
            'video_id': video_id,
            'language': transcript.language,
            'language_code': transcript.language_code,
            'is_generated': transcript.is_generated,
            'video_metadata': video_metadata
        })
        
    except NoTranscriptFound:
        return jsonify({'error': 'No transcript available for this video'}), 404
    except VideoUnavailable:
        return jsonify({'error': 'Video is unavailable or private'}), 404
    except Exception as e:
        return jsonify({'error': f'Failed to fetch transcript: {str(e)}'}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'YouTube Transcript API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
