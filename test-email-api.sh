#!/bin/bash

# Affluences Email Confirmation API Test Script
# This script provides curl commands to test various API endpoints
# 
# Usage: bash test-email-api.sh <your-email@unipd.it>

EMAIL="${1:-test@unipd.it}"

echo "=================================================="
echo "Affluences Email Confirmation API Tester"
echo "=================================================="
echo "Testing with email: $EMAIL"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-POST}"
    local data="${4:-{\"email\":\"$EMAIL\"}}"
    
    echo ""
    echo "=================================================="
    echo "Testing: $name"
    echo "URL: $url"
    echo "Method: $method"
    echo "=================================================="
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
            -H "Accept: application/json")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    elif [ "$http_code" -eq 404 ]; then
        echo -e "${YELLOW}✗ Not Found (HTTP $http_code)${NC}"
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    fi
    
    echo "Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
}

# Test reservation endpoint (to see error message)
echo ""
echo "=================================================="
echo "1. Testing Booking Endpoint (to capture error)"
echo "=================================================="
echo "This should fail and show the error message..."
test_endpoint \
    "Booking with unconfirmed email" \
    "https://reservation.affluences.com/api/reserve/test-resource-id" \
    "POST" \
    "{\"email\":\"$EMAIL\",\"date\":\"2026-01-15\",\"start_time\":\"09:00\",\"end_time\":\"11:00\",\"person_count\":1}"

# Test potential email verification endpoints
echo ""
echo "=================================================="
echo "2. Testing Potential Verification Endpoints"
echo "=================================================="

test_endpoint \
    "Endpoint 1: /api/email/verify" \
    "https://reservation.affluences.com/api/email/verify"

test_endpoint \
    "Endpoint 2: /api/email/send-confirmation" \
    "https://reservation.affluences.com/api/email/send-confirmation"

test_endpoint \
    "Endpoint 3: /api/email/request-confirmation" \
    "https://reservation.affluences.com/api/email/request-confirmation"

test_endpoint \
    "Endpoint 4: /app/v3/email/verify" \
    "https://api.affluences.com/app/v3/email/verify"

test_endpoint \
    "Endpoint 5: /app/v3/email/send-confirmation" \
    "https://api.affluences.com/app/v3/email/send-confirmation"

test_endpoint \
    "Endpoint 6: /app/v3/auth/email/verify" \
    "https://api.affluences.com/app/v3/auth/email/verify"

# Test library info endpoint (to check for email requirements)
echo ""
echo "=================================================="
echo "3. Testing Library Info Endpoint"
echo "=================================================="
echo "Checking if library info contains email verification requirements..."

test_endpoint \
    "Library Info" \
    "https://api.affluences.com/app/v3/sites/4b867ddd-46fd-4fe5-a57b-cdd4a3e1520d" \
    "GET"

# Summary
echo ""
echo "=================================================="
echo "Test Complete!"
echo "=================================================="
echo ""
echo "What to do next:"
echo "1. Look for any successful responses (HTTP 200/201)"
echo "2. Check error messages for patterns like:"
echo "   - 'email not verified'"
echo "   - 'confirm your email'"
echo "   - 'email verification required'"
echo "3. If you find a working endpoint, update:"
echo "   - lib/emailConfirmation.js (add the endpoint)"
echo "   - lib/emailConfirmation.js (add error patterns)"
echo ""
echo "To test with a specific resource ID:"
echo "  curl -X POST 'https://reservation.affluences.com/api/reserve/YOUR_RESOURCE_ID' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"$EMAIL\",\"date\":\"2026-01-15\",\"start_time\":\"09:00\",\"end_time\":\"11:00\",\"person_count\":1}'"
echo ""
