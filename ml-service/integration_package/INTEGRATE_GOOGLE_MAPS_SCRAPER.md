# Google Maps Scraper Integration Guide

## What You Need from SIKBO Project

### 1. Give These Files to the Other Developer:

**File 1: `google_maps_scraper_endpoint.js`**
- Contains 2 API endpoints:
  - `POST /scrape-google-reviews` - Scrapes from Google Maps
  - `GET /google-reviews` - Gets saved reviews

**File 2: Database SQL (run this on their database):**
```sql
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255),
    restaurant_place_id VARCHAR(255),
    reviewer_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'google_maps',
    helpful_count INTEGER DEFAULT 0
);
```

---

## Integration Steps for Their Project

### Step 1: Install Dependency
```bash
npm install node-fetch
```

### Step 2: Add the Route to Their Server

In their main server file (e.g., `server.js` or `app.js`), add:

```javascript
// At the top with other requires
const googleMapsScraper = require('./google_maps_scraper_endpoint');

// After app initialization
app.use('/api', googleMapsScraper);
```

### Step 3: Make Database Pool Available

In their server file, ensure the database pool is accessible:

```javascript
// If they use pg Pool
const pool = new Pool({ /* their config */ });

// Make it available to routes
app.locals.pool = pool;
```

---

## API Endpoints After Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scrape-google-reviews` | POST | Scrapes 5 reviews per rating from Google Maps |
| `/api/google-reviews` | GET | Gets all saved Google Maps reviews |

---

## Test the Integration

```bash
# 1. Scrape reviews
curl -X POST http://localhost:5000/api/scrape-google-reviews

# 2. Get saved reviews
curl http://localhost:5000/api/google-reviews
```

---

## Configuration (Important!)

The scraper is already configured for:
- **Restaurant:** The French Door, Coimbatore
- **Place ID:** ChIJ3yQ4HeJYqDsR0Ky_wwSgVaY
- **Google API Key:** AIzaSyC6cVc-f9ZFugq2W3JOgCW6N6SyesQo44I

To change restaurant, modify these lines in `google_maps_scraper_endpoint.js`:
```javascript
const RESTAURANT_PLACE_ID = 'NEW_PLACE_ID_HERE';
const RESTAURANT_NAME = 'New Restaurant Name';
```

---

## How It Works

1. When you call `POST /api/scrape-google-reviews`:
   - It calls Google Places API
   - Gets all reviews
   - Organizes by rating (5★, 4★, 3★, 2★, 1★)
   - Takes 5 from each rating
   - Saves to database (skips duplicates)

2. When you call `GET /api/google-reviews`:
   - Returns all saved reviews from database

---

## No Conflicts with Zomato

This adds a separate `source` field:
- `source = 'google_maps_api'` for these reviews
- Their Zomato scraper can use `source = 'zomato'`

Both can coexist in the same `reviews` table!
