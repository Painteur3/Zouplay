import os
import requests
import time
from googletrans import Translator  # pip install googletrans==4.0.0-rc1

def clean_filename(name):
    return "".join(c for c in name if c.isalnum() or c in (" ", "_")).rstrip()

def anilist_query(query, variables=None):
    url = "https://graphql.anilist.co"
    response = requests.post(url, json={'query': query, 'variables': variables})
    response.raise_for_status()
    return response.json()

anime_name = "Kimetsu no Yaiba"  # Choisir animé
MAX_CHARACTERS = 60

translator = Translator()

# Récupération de l'anime
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

# Création dossier
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

characters_info = []
page = 1

# Récupération des personnages
while True:
    characters_data = anilist_query(query_characters, {"id": anime_id, "perPage": 25, "page": page})
    media = characters_data['data']['Media']['characters']
    edges = media['edges']
    
    if not edges:
        break
    
    for char in edges:
        name = clean_filename(char['node']['name']['full'].split(" ")[0])
        image_url = char['node']['image']['large']
        if image_url and name not in [c['name'] for c in characters_info]:
            characters_info.append({'name': name, 'img_url': image_url})
        
        if len(characters_info) >= MAX_CHARACTERS:
            break
    
    if not media['pageInfo']['hasNextPage'] or len(characters_info) >= MAX_CHARACTERS:
        break
    page += 1

# Traduction de tous les prénoms en une seule requête
names_to_translate = [c['name'] for c in characters_info]
try:
    translations = translator.translate(names_to_translate, src='auto', dest='fr')
    translated_names = [t.text for t in translations]
except Exception:
    translated_names = names_to_translate  # fallback en cas d'erreur

# Téléchargement des images
characters_downloaded = []
for char, translated_name in zip(characters_info, translated_names):
    try:
        response = requests.get(char['img_url'])
        response.raise_for_status()
        img_filename = f"{translated_name}.jpg"
        with open(os.path.join(folder, img_filename), 'wb') as f:
            f.write(response.content)
        characters_downloaded.append({'name': translated_name, 'img': img_filename})
        print(f"Téléchargé : {translated_name}")
        time.sleep(0.5)
    except Exception as e:
        print(f"Erreur téléchargement {translated_name} : {e}")

print(f"Téléchargement terminé ! Total images : {len(characters_downloaded)}. Les images sont dans : {folder}")

# Génération du fichier characters.txt
txt_file_path = os.path.join(folder, "characters.txt")
with open(txt_file_path, "w", encoding="utf-8") as txt_file:
    for char in characters_downloaded:
        txt_file.write(f'{{ nom: "{char["name"]}", img: "images/{char["img"]}" }},\n')

print(f"Fichier texte généré : {txt_file_path}")
