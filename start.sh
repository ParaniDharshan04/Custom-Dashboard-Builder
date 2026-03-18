#!/bin/bash

# Exit on any error
set -e

echo "Starting Custom Dashboard Builder..."

# Run database migrations
echo "Running database migrations..."
cd backend
alembic upgrade head

# Start the application
echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}