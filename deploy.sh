#!/usr/bin/env bash
set -euo pipefail

echo "Building..."
ng build --configuration production

echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting --project rustic-ai-rkapps

echo "Done."
