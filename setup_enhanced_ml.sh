#!/bin/bash

echo "🚀 Setting up SIKBO Enhanced ML Service"
echo "======================================"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ Python 3 and pip3 are available"

# Navigate to ML service directory
cd ml-service

echo "📦 Creating Python virtual environment..."
python3 -m venv venv

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🤖 Downloading spaCy language model..."
python -m spacy download en_core_web_sm

echo "📚 Downloading NLTK data..."
python -c "
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('vader_lexicon', quiet=True)
print('NLTK data downloaded successfully')
"

echo "🎭 Installing Playwright browsers..."
playwright install chromium

echo "✅ Enhanced ML Service setup completed!"
echo ""
echo "🔧 Next steps:"
echo "1. Execute the database schema in your Neon DB console:"
echo "   - Copy the SQL from database_schema.sql"
echo "   - Run it in your Neon DB console"
echo ""
echo "2. Start the enhanced ML service:"
echo "   cd ml-service"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "3. Test the service:"
echo "   python ../test_ml_service.py"
echo ""
echo "4. Test The French Door scraping:"
echo "   curl -X POST http://localhost:8001/test-french-door"
echo ""
echo "🌟 Features available:"
echo "   • Advanced multi-model sentiment analysis"
echo "   • Google Maps review scraping"
echo "   • Multi-category analysis (Food/Service/Ambiance/Value)"
echo "   • Emotion detection and urgency assessment"
echo "   • PostgreSQL/Neon database integration"
echo "   • AI-powered insights and recommendations"