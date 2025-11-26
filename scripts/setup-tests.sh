#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up test environment...${NC}\n"

# Install dependencies
echo -e "${YELLOW}Installing test dependencies...${NC}"
pnpm add -D jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom

# Run tests
echo -e "\n${GREEN}Running tests...${NC}\n"
pnpm test

# Show coverage
echo -e "\n${GREEN}Generating coverage report...${NC}\n"
pnpm test:coverage

echo -e "\n${GREEN}✓ Test setup complete!${NC}"
echo -e "\n${YELLOW}Available commands:${NC}"
echo -e "  ${GREEN}pnpm test${NC}           - Run all tests"
echo -e "  ${GREEN}pnpm test:watch${NC}     - Run tests in watch mode"
echo -e "  ${GREEN}pnpm test:coverage${NC}  - Run tests with coverage report"
