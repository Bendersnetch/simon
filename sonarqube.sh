#!/bin/bash
# ---------------- CONFIGURATION ----------------
BASE_DIR="../."
SONAR_TOKEN="$1"
# ------------------------------------------------

# Parse command line arguments
USE_DOCKER_DESKTOP=false
while getopts "d" opt; do
  case $opt in
    d)
      USE_DOCKER_DESKTOP=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Set SonarQube host based on environment
if [ "$USE_DOCKER_DESKTOP" = true ]; then
  SONAR_HOST="http://host.docker.internal:9000"
  echo "Using Docker Desktop URL"
else
  SONAR_HOST="http://172.17.0.1:9000"
  echo "Using WSL2/Linux URL"
fi

echo "Starting multi-repo analysis with Docker SonarScanner..."
echo "SonarQube: $SONAR_HOST"
echo "Repos folder: $BASE_DIR"
echo "------------------------------------------"

for repo in "$BASE_DIR"/*; do
  if [ -f "$repo/package.json" ]; then
    echo "Processing repo: $(basename $repo)"
    cd "$repo" || continue
    
    # Install dependencies if missing
    if [ ! -d "node_modules" ]; then
      echo "Installing npm dependencies..."
      npm install
    fi
    
    # Run Jest tests and generate coverage
    echo "Running Jest tests with coverage..."
    npm run test -- --coverage --silent
    
    LCOV_PATH="$repo/coverage/lcov.info"
    if [ ! -f "$LCOV_PATH" ]; then
      echo "ERROR: coverage/lcov.info not found, skipping this repo."
      echo "------------------------------------------"
      continue
    fi
    
    # Create sonar-project.properties
    cat > sonar-project.properties <<EOL
sonar.projectKey=$(basename $repo)
sonar.projectName=$(basename $repo)
sonar.projectVersion=1.0
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.sourceEncoding=UTF-8
EOL
    
    # Run SonarScanner via Docker
    echo "Running SonarScanner Docker..."
    docker run --rm \
      -v "$repo":/usr/src \
      -w /usr/src \
      -e SONAR_TOKEN=$SONAR_TOKEN \
      sonarsource/sonar-scanner-cli \
      -Dsonar.host.url=$SONAR_HOST
    
    echo "Finished processing $(basename $repo)"
    echo "------------------------------------------"
    cd - > /dev/null
  fi
done

echo "All repos have been processed!"