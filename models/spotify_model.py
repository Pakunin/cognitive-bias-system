import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

_spotify = None

def get_client():
    global _spotify
    if _spotify is None:
        auth = SpotifyClientCredentials(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET
        )
        _spotify = spotipy.Spotify(auth_manager=auth)
    return _spotify

def search_playlists(query: str, max_results: int = 2) -> list[dict]:
    spotify = get_client()
    
    results = spotify.search(
        q=query,
        type="playlist",
        limit=max_results
    )
    
    playlists = []
    for item in results["playlists"]["items"]:
        if item is None:
            continue
        playlists.append({
            "id": item["id"],
            "title": item["name"],
            "description": item.get("description", "")[:150],
            "url": item["external_urls"]["spotify"],
            "thumbnail": item["images"][0]["url"] if item["images"] else "",
            "owner": item["owner"]["display_name"],
            "type": "music"
        })
    
    return playlists