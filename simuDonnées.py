import random
import time
import json
import csv
from datetime import datetime, timedelta

# --- CONFIGURATION DES SCÉNARIOS ---
scenarios = {
    "1": {
        "name": "Été Ensoleillé",
        "temp_range": (25.0, 35.0),
        "hum_range": (30.0, 50.0),
        "uv_range": (6, 11),
        "co2_base": 400, # Air pur
    },
    "2": {
        "name": "Nuit d'Automne Pluvieuse",
        "temp_range": (8.0, 14.0),
        "hum_range": (80.0, 98.0),
        "uv_range": (0, 0),
        "co2_base": 420,
    },
    "3": {
        "name": "Pic de Pollution Urbain",
        "temp_range": (20.0, 25.0),
        "hum_range": (40.0, 60.0),
        "uv_range": (2, 5),
        "co2_base": 1200, # Air vicié
    }
}

# --- FONCTIONS UTILITAIRES ---

def random_walk(current_val, min_val, max_val, step=0.5):
    """Fait évoluer une valeur doucement (pas de sauts brusques)"""
    change = random.uniform(-step, step)
    new_val = current_val + change
    return max(min_val, min(new_val, max_val))

def generate_gps(lat, lon, radius=0.001):
    """Simule une légère dérive GPS ou un déplacement"""
    new_lat = lat + random.uniform(-radius, radius)
    new_lon = lon + random.uniform(-radius, radius)
    return new_lat, new_lon

# --- MAIN PROGRAM ---

def main():
    print("--- GÉNÉRATEUR DE DONNÉES IOT ---")
    print("Choisis un scénario météo :")
    for key, val in scenarios.items():
        print(f"[{key}] {val['name']}")
    
    choice = input("Ton choix (1-3) : ")
    if choice not in scenarios: choice = "1"
    
    try:
        count = int(input("Combien de points de données générer ? (ex: 100) : "))
    except:
        count = 100

    scene = scenarios[choice]
    
    # Initialisation des valeurs de départ (au milieu des ranges)
    curr_temp = sum(scene["temp_range"]) / 2
    curr_hum = sum(scene["hum_range"]) / 2
    curr_uv = scene["uv_range"][0] # Commence bas
    curr_co2 = scene["co2_base"]
    
    # Coordonnées de base (ex: Paris)
    lat_base = 48.8566
    lon_base = 2.3522
    
    data_list = []
    start_time = datetime.now()

    print(f"\n>>> Génération de {count} points basés sur: {scene['name']}...\n")

    # Préparation des fichiers
    json_filename = "data_iot.json"
    csv_filename = "data_iot.csv"

    with open(csv_filename, 'w', newline='') as csvfile:
        fieldnames = ['timestamp', 'device_id', 'temp', 'hum', 'uv_index', 'co2_ppm', 'mq135_raw', 'wkt_geom']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(count):
            # 1. Simulation du temps qui passe (10 min par point)
            timestamp = start_time + timedelta(minutes=10 * i)
            
            # 2. Évolution des capteurs (Random Walk)
            curr_temp = random_walk(curr_temp, *scene["temp_range"], step=0.3)
            # L'humidité inverse souvent la température
            curr_hum = random_walk(curr_hum, *scene["hum_range"], step=0.5)
            
            # UV monte et descend (simulation simple ici)
            uv_fluctuation = random.randint(0, 1) if curr_uv < scene["uv_range"][1] else -1
            curr_uv = max(0, min(curr_uv + uv_fluctuation, scene["uv_range"][1]))

            # MQ135 / ADS1115
            # ADS1115 est 16-bit (jusqu'à 32767 en single-ended). 
            # Plus le voltage est haut, plus l'air est sale (généralement).
            curr_co2 = random_walk(curr_co2, scene["co2_base"]-100, scene["co2_base"]+1000, step=15)
            # On simule la valeur brute ADC proportionnelle au CO2
            mq135_raw = int((curr_co2 / 2000) * 25000) + random.randint(-50, 50) 

            # GPS PostGIS
            lat, lon = generate_gps(lat_base, lon_base)
            
            # Création de l'objet
            record = {
                "timestamp": timestamp.isoformat(),
                "device_id": "raspi-sensor-v1",
                "temp": round(curr_temp, 2),
                "hum": round(curr_hum, 2),
                "uv_index": int(curr_uv),
                "co2_ppm": int(curr_co2),
                "mq135_raw": mq135_raw,
                # Format WKT pour PostGIS (POINT(Longitude Latitude))
                "wkt_geom": f"POINT({lon} {lat})" 
            }

            # 3. Affichage Brut (Console)
            print(f"[{timestamp.strftime('%H:%M')}] T:{record['temp']}°C | H:{record['hum']}% | UV:{record['uv_index']} | Air:{record['co2_ppm']}ppm (ADC:{record['mq135_raw']})")

            # 4. Sauvegarde CSV
            writer.writerow(record)
            
            # 5. Stockage pour JSON
            data_list.append(record)

            # Petit délai
            time.sleep(0.02)

    # Sauvegarde JSON
    with open(json_filename, 'w') as f:
        json.dump(data_list, f, indent=4)

    print(f"\nTerminé ! 🚀")
    print(f"1. Fichier CSV généré : {csv_filename}")
    print(f"2. Fichier JSON généré : {json_filename}")

if __name__ == "__main__":
    main()