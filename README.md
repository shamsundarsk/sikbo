# SIKBO - AI Restaurant Analytics

**AI-powered dashboard for restaurant owners to make data-driven menu decisions.**

## Quick Start

```bash
# Backend
cd backend
npm install
npm start

# Frontend  
cd frontend
npm install
npm start

# ML Service
cd ml-service
pip install -r requirements.txt
python app.py
```

## Features

- **Sales Analytics** - Track dish performance
- **Review Sentiment** - Analyze customer feedback
- **Trend Detection** - Discover trending dishes
- **Smart Recommendations** - Remove/Fix/Promote/Add dishes

## Tech Stack

- Frontend: React + Tailwind
- Backend: Node.js + Express
- Database: MongoDB
- ML: Python + scikit-learn
- Scraping: Playwright + snscrape

## Architecture

```
React Dashboard → Node API → MongoDB
                     ↓
              Python ML Service
```

Built for restaurant owners to replace guesswork with data-driven decisions.