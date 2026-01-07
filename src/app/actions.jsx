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
