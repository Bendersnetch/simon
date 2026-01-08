'use server'

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
        return { success: true, token: data.token };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

export async function getSensorData() {
    try {
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        const response = await fetch(`${apiGatewayUrl}/api/v1/sensor-data-gateway/recent`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch sensor data');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Sensor data error:', error);
        return { success: false, error: error.message };
    }
}

export async function addSensor({ nom, origin, apiKey, type, latitude, longitude, active = true }) {
    try {
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        const response = await fetch(`${apiGatewayUrl}/api/v1/capteur-gateway`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // TODO: Définir l'endpoint correct (ex: /capteur-gateway/:id ou /capteur-gateway?nom=XXX)
        const response = await fetch(`${apiGatewayUrl}/api/v1/capteur-gateway/${sensorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // TODO: Définir l'endpoint correct (ex: PUT /capteur-gateway/:id)
        const response = await fetch(`${apiGatewayUrl}/api/v1/capteur-gateway/${sensorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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
        const apiGatewayUrl = process.env.API_GATEWAY_URL;
        // TODO: Définir l'endpoint correct (ex: PATCH /capteur-gateway/:id/status)
        const response = await fetch(`${apiGatewayUrl}/api/v1/capteur-gateway/${sensorId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
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
