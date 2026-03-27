#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SCOOBY — Restaurant Intelligence Platform
# Starts: ML Service (8001) → Backend API (5001) → Web Dashboard (3000)
# ─────────────────────────────────────────────────────────────────────────────

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}[SCOOBY]${NC} $1"; }
success() { echo -e "${GREEN}[SCOOBY]${NC} $1"; }
warn()    { echo -e "${YELLOW}[SCOOBY]${NC} $1"; }
error()   { echo -e "${RED}[SCOOBY]${NC} $1"; exit 1; }

# ── Dependency checks ─────────────────────────────────────────────────────────
command -v node   >/dev/null 2>&1 || error "Node.js not found. Install from https://nodejs.org"
command -v python3 >/dev/null 2>&1 || error "Python 3 not found. Install from https://python.org"
pgrep -x mongod >/dev/null 2>&1   || error "MongoDB is not running.\n  Start it with: brew services start mongodb-community"

success "Node $(node --version) · Python $(python3 --version | cut -d' ' -f2) · MongoDB running"

# ── ML Service ────────────────────────────────────────────────────────────────
info "Starting ML Service on :8001 ..."
cd ml-service
if [ ! -d "venv" ]; then
  info "Creating Python virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
python app.py &
ML_PID=$!
cd ..
sleep 4

# ── Backend API ───────────────────────────────────────────────────────────────
info "Starting Backend API on :5001 ..."
cd backend
npm install --silent
npm start &
BACKEND_PID=$!
cd ..
sleep 3

# ── Web Dashboard ─────────────────────────────────────────────────────────────
info "Starting Web Dashboard on :3000 ..."
cd frontend
npm install --silent
npm start &
FRONTEND_PID=$!
cd ..

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
success "All services are running!"
echo ""
echo -e "  ${CYAN}Web Dashboard${NC}   →  http://localhost:3000"
echo -e "  ${CYAN}Backend API${NC}     →  http://localhost:5001/api/v1"
echo -e "  ${CYAN}ML Service${NC}      →  http://localhost:8001"
echo ""
echo -e "  ${YELLOW}Mobile App${NC}      →  cd Restaurant-Insight-Mobile/artifacts/sikbo-mobile"
echo -e "                     npx expo start"
echo -e "                     Scan the QR code with Expo Go"
echo ""
echo "Press Ctrl+C to stop all services."

trap "echo ''; warn 'Stopping all services...'; kill \$ML_PID \$BACKEND_PID \$FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
