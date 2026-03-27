# SCOOBY — Restaurant Intelligence Platform

SCOOBY is an AI-powered restaurant management system built for **The French Door** café. It aggregates real customer reviews from Google Maps and Zomato, runs sentiment analysis using VADER, and surfaces actionable insights across food performance, service quality, staff management, customer flow, menu profitability, and raw material costs — available on both a web dashboard and a mobile app.

## Stack

| Layer | Tech |
|---|---|
| Web frontend | React 18, Tailwind CSS |
| Mobile | React Native, Expo SDK 54, Expo Router, React Query |
| Backend | Node.js, Express, MongoDB (MVC) |
| ML service | Python, Flask, VADER |
| Databases | MongoDB (primary), Neon PostgreSQL (review source) |

---

## Running the project

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB running locally
- **Mobile only:** Expo Go installed on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

### Quick start (all services)

```bash
chmod +x start.sh
./start.sh
```

This starts the ML service (8001), backend API (5001), and web dashboard (3000) in sequence.

---

### Manual start (one terminal per service)

```bash
# Terminal 1 — Backend API
cd backend && npm install && npm run dev

# Terminal 2 — ML Service
cd ml-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py

# Terminal 3 — Web Dashboard
cd frontend && npm install && npm start

# Terminal 4 — Mobile App
cd Restaurant-Insight-Mobile/artifacts/sikbo-mobile
npm install
npx expo start
```

---

### Running the mobile app with Expo Go

1. **Install Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Find your machine's LAN IP** (the phone and computer must be on the same Wi-Fi):
   ```bash
   # macOS
   ipconfig getifaddr en0

   # Windows
   ipconfig   # look for IPv4 Address

   # Linux
   hostname -I
   ```

3. **Set the API URL** in `Restaurant-Insight-Mobile/artifacts/sikbo-mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5001/api/v1
   ```
   Example: `EXPO_PUBLIC_API_URL=http://192.168.1.42:5001/api/v1`

4. **Start the mobile app:**
   ```bash
   cd Restaurant-Insight-Mobile/artifacts/sikbo-mobile
   npx expo start
   ```

5. **Scan the QR code** shown in the terminal:
   - iOS: use the default Camera app
   - Android: use the QR scanner inside the Expo Go app

6. The app opens on your phone and connects to the same backend as the web dashboard. Pull down on any screen to refresh data.

> **Note:** Do not use `localhost` in the mobile `.env` — the phone cannot reach your computer's localhost. Always use the LAN IP.

---

### Environment files

`backend/.env`
```
MONGODB_URI=mongodb://localhost:27017/scooby
PORT=5001
ML_SERVICE_URL=http://localhost:8001
```

`ml-service/.env`
```
NEON_DB_URL=your_neon_postgres_connection_string
```

`Restaurant-Insight-Mobile/artifacts/sikbo-mobile/.env`
```
EXPO_PUBLIC_API_URL=http://<LAN_IP>:5001/api/v1
```

---

### Service URLs

| Service | URL |
|---|---|
| Web Dashboard | http://localhost:3000 |
| Backend API | http://localhost:5001/api/v1 |
| ML Service | http://localhost:8001 |
| Mobile | Scan QR code with Expo Go |

The mobile app and web dashboard share the same backend — any data change reflects on both platforms immediately.
