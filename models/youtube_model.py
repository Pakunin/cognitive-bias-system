from googleapiclient.discovery import build
from config import YOUTUBE_API_KEY

_youtube = None

def get_client():
    global _youtube
    if _youtube is None:
        _youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    return _youtube

def search_videos(query: str, max_results: int = 3) -> list[dict]:
    youtube = get_client()
    
    request = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results,
        relevanceLanguage="en",
        safeSearch="strict"      # important for your use case
    )
    response = request.execute()
    
    results = []
    for item in response.get("items", []):
        video_id = item["id"]["videoId"]
        results.append({
            "id": video_id,
            "title": item["snippet"]["title"],
            "description": item["snippet"]["description"][:150],
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
            "channel": item["snippet"]["channelTitle"],
            "type": "video"
        })
    
    return results