const API_URL = 'http://localhost:5000';

// Check API health on load
async function checkHealth() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            statusIndicator.classList.add('healthy');
            statusText.textContent = 'API Connected';
        } else {
            statusIndicator.classList.add('error');
            statusText.textContent = 'API Degraded - Model not loaded';
        }
    } catch (error) {
        statusIndicator.classList.add('error');
        statusText.textContent = 'API Offline - Please start the backend';
    }
}

// Handle form submission
document.getElementById('predictionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const predictBtn = document.getElementById('predictBtn');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Hide previous results
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    // Disable button
    predictBtn.disabled = true;
    predictBtn.textContent = 'Predicting...';
    
    // Collect form data
    const formData = {
        MedInc: parseFloat(document.getElementById('MedInc').value),
        HouseAge: parseFloat(document.getElementById('HouseAge').value),
        AveRooms: parseFloat(document.getElementById('AveRooms').value),
        AveBedrms: parseFloat(document.getElementById('AveBedrms').value),
        Population: parseFloat(document.getElementById('Population').value),
        AveOccup: parseFloat(document.getElementById('AveOccup').value),
        Latitude: parseFloat(document.getElementById('Latitude').value),
        Longitude: parseFloat(document.getElementById('Longitude').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Display result
            const priceValue = (data.prediction_value * 100000).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            });
            
            document.getElementById('price').textContent = priceValue;
            document.getElementById('details').textContent = 
                `Prediction based on California housing data`;
            resultDiv.classList.remove('hidden');
        } else {
            // Display error
            errorDiv.textContent = `Error: ${data.error || 'Prediction failed'}`;
            if (data.details) {
                errorDiv.textContent += `\n${JSON.stringify(data.details, null, 2)}`;
            }
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = `Network Error: ${error.message}. Make sure the API is running.`;
        errorDiv.classList.remove('hidden');
    } finally {
        predictBtn.disabled = false;
        predictBtn.textContent = 'Predict Price';
    }
});

// Load sample data
function loadSample() {
    document.getElementById('MedInc').value = '3.5';
    document.getElementById('HouseAge').value = '25';
    document.getElementById('AveRooms').value = '5.5';
    document.getElementById('AveBedrms').value = '1.2';
    document.getElementById('Population').value = '1500';
    document.getElementById('AveOccup').value = '3.0';
    document.getElementById('Latitude').value = '37.5';
    document.getElementById('Longitude').value = '-122.0';
}

// Check health on page load
checkHealth();
