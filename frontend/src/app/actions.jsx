'use server'

import { cookies } from 'next/headers';

export async function loginUser(email, password) {
    try {
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        const response = await fetch(`${apiGatewayUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();

        // Stocker le token dans un cookie sécurisé
        (await cookies()).set('session_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 semaine
            path: '/',
        });

        return { success: true, token: data.token };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Créer un nouvel utilisateur via l'API /api/v1/auth/register
 */
export async function registerUser({ nom, prenom, email, password, role = 'USER' }) {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Non authentifié - veuillez vous connecter");

        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        const response = await fetch(`${apiGatewayUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                lastname: nom,
                firstname: prenom,
                email,
                password,
                // Le rôle n'est pas dans le DTO actuel, mais on le garde au cas où ou on l'ignore si l'API est stricte.
                // L'API semble attendre firstname/lastname.
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}: Impossible de créer l'utilisateur`);
        }

        const data = await response.json();
        console.log('[registerUser] User created:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Register user error:', error);
        return { success: false, error: error.message };
    }
}

// Helper pour récupérer le token
async function getAuthToken() {
    return (await cookies()).get('session_token')?.value;
}

export async function getSensorData() {
    try {
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // Public endpoint, no auth needed usually, but can add if required
        console.log(`[getSensorData] Fetching from: ${apiGatewayUrl}/api/v1/sensor-data-gateway/recent`);
        const response = await fetch(`${apiGatewayUrl}/api/v1/sensor-data-gateway/recent`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Important pour ne pas cacher les données de capteurs
        });

        console.log(`[getSensorData] Response status: ${response.status}`);

        if (!response.ok) {
            const text = await response.text();
            console.error(`[getSensorData] Error body: ${text}`);
            throw new Error(`API Error ${response.status}: ${text}`);
        }

        const data = await response.json();
        console.log(`[getSensorData] Data received (sample):`, Array.isArray(data) ? `Array of ${data.length} items` : typeof data);
        return { success: true, data };
    } catch (error) {
        console.error('Sensor data error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Récupérer la liste de tous les capteurs enregistrés (depuis PostgreSQL)
 */
export async function getAllSensors() {
    try {
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        const url = `${apiGatewayUrl}/api/v1/sensor-gateway`;

        console.log(`[getAllSensors] Fetching from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`[getAllSensors] Error: ${response.status} - ${text}`);
            throw new Error(`API Error ${response.status}`);
        }

        const data = await response.json();
        console.log(`[getAllSensors] Received ${data.length} sensors`);
        return { success: true, data };
    } catch (error) {
        console.error('Get all sensors error:', error);
        return { success: false, error: error.message };
    }
}

export async function addSensor({ nom, origin, apiKey, type, latitude, longitude, active = true }) {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Non authentifié");

        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        const response = await fetch(`${apiGatewayUrl}/api/v1/sensor-gateway`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nom, origin, apiKey, type, latitude, longitude, active }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add sensor');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Add sensor error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Récupérer les informations d'un capteur par son ID/numéro de série
 * TODO: Remplacer l'endpoint quand disponible
 */
export async function getSensorById(sensorId) {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Non authentifié");

        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // TODO: Définir l'endpoint correct (ex: /sensor-gateway/:id ou /sensor-gateway?nom=XXX)
        const response = await fetch(`${apiGatewayUrl}/api/v1/sensor-gateway/${sensorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Capteur non trouvé');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Get sensor error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Modifier les informations d'un capteur existant
 * TODO: Remplacer l'endpoint quand disponible
 */
export async function updateSensor(sensorId, { latitude, longitude, nom, type }) {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Non authentifié");

        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // TODO: Définir l'endpoint correct (ex: PUT /sensor-gateway/:id)
        const response = await fetch(`${apiGatewayUrl}/api/v1/sensor-gateway/${sensorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latitude, longitude, nom, type }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Échec de la modification du capteur');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Update sensor error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Désactiver un capteur (sans le supprimer)
 * TODO: Remplacer l'endpoint quand disponible
 */
export async function disableSensor(sensorId) {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Non authentifié");

        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // TODO: Définir l'endpoint correct (ex: PATCH /sensor-gateway/:id/status)
        const response = await fetch(`${apiGatewayUrl}/api/v1/sensor-gateway/${sensorId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: false }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Échec de la désactivation du capteur');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Disable sensor error:', error);
        return { success: false, error: error.message };
    }
}
