import os
import requests
import time

def clean_filename(name):
    return "".join(c for c in name if c.isalnum() or c in (" ", "_")).rstrip()

def anilist_query(query, variables=None):
    url = "https://graphql.anilist.co"
    response = requests.post(url, json={'query': query, 'variables': variables})
    response.raise_for_status()
    return response.json()

anime_name = "Kimetsu no Yaiba" # Choisir animé

# Requête pour récupérer l'anime
query_anime = '''
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title { romaji }
  }
}
'''
anime_data = anilist_query(query_anime, {"search": anime_name})
anime_id = anime_data['data']['Media']['id']
anime_title = anime_data['data']['Media']['title']['romaji']
print(f"Anime trouvé : {anime_title} (ID {anime_id})")

# Dossier bureau
desktop = os.path.join(os.path.expanduser("~"), "Desktop")
folder = os.path.join(desktop, clean_filename(anime_title))
os.makedirs(folder, exist_ok=True)

# Requête personnages
query_characters = '''
query ($id: Int, $perPage: Int, $page: Int) {
  Media(id: $id, type: ANIME) {
    characters(perPage: $perPage, page: $page) {
      pageInfo { hasNextPage }
      edges {
        node {
          name { full }
          image { large }
        }
      }
    }
  }
}
'''

characters_downloaded = set()
page = 1
while True:
    characters_data = anilist_query(query_characters, {"id": anime_id, "perPage": 25, "page": page})
    media = characters_data['data']['Media']['characters']
    edges = media['edges']
    
    if not edges:
        break
    
    for char in edges:
        # Ne garder que le prénom (premier mot)
        name = clean_filename(char['node']['name']['full'].split(" ")[0])
        if name in characters_downloaded:
            continue
        image_url = char['node']['image']['large']
        if not image_url:
            continue
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            with open(os.path.join(folder, f"{name}.jpg"), 'wb') as f:
                f.write(response.content)
            characters_downloaded.add(name)
            print(f"Téléchargé : {name}")
            time.sleep(0.5)
        except Exception as e:
            print(f"Erreur téléchargement {name} : {e}")
    
    if not media['pageInfo']['hasNextPage'] or len(characters_downloaded) >= 100:
        break
    page += 1

print(f"Téléchargement terminé ! Total images : {len(characters_downloaded)}. Les images sont dans : {folder}")

# Générer characters.txt avec le nom et le chemin de l'image
txt_file_path = os.path.join(folder, "characters.txt")
with open(txt_file_path, "w", encoding="utf-8") as txt_file:
    for name in characters_downloaded:
        img_filename = f"{name}.jpg"
        txt_file.write(f'{{ nom: "{name}", img: "images/{img_filename}" }},\n')

print(f"Fichier texte généré : {txt_file_path}")
