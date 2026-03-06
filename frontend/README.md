# House Price Predictor Frontend

A clean, modern web interface for the California House Price Prediction API.

## Features

- Real-time API health monitoring
- Form validation with helpful hints
- Responsive design for mobile and desktop
- Clean gradient UI with smooth animations
- Error handling and user feedback

## Setup

1. Make sure the Flask API is running:
   ```bash
   cd ..
   python app.py
   ```

2. Open `index.html` in your browser, or serve it with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

3. Visit `http://localhost:8000` (or just open index.html directly)

## Usage

1. Fill in the house features:
   - Median Income (block group)
   - House Age (years)
   - Average Rooms per household
   - Average Bedrooms per household
   - Population (block group)
   - Average Occupancy (household members)
   - Latitude (32-42 for California)
   - Longitude (-125 to -114 for California)

2. Click "Predict Price" to get the estimated house value

## API Configuration

The frontend connects to `http://localhost:5000` by default. To change this, edit the `API_URL` constant in `app.js`.

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and animations
- `app.js` - API integration and form handling
