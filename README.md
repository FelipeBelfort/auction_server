# Auction Server

A high-performance HTTP-based bidding backend that handles simultaneous auction requests with in-memory data storage and session management.

## Features

- **Real-time Bidding System**: Register bid amounts for different users and items
- **Top Bids Tracking**: Retrieve top 15 bids per item in descending order
- **Session Management**: Simple login system with 10-minute session validity
- **High Performance**: Optimized for handling simultaneous requests
- **In-Memory Storage**: No disk persistence required, designed for continuous operation
- **Dockerized**: Easy deployment with Docker containers


## API Endpoints

All API calls return HTTP status code 200 on success. Any error condition returns a non-200 status code. Number parameters and return values are sent in decimal ASCII representation. Users and items are created ad-hoc the first time they are referenced.

### Login
Returns a session key valid for 10 minutes. Session keys are reasonably unique strings without spaces or special characters.

**Request:**
```
GET /<userID>/login
```

**Parameters:**
- `<userID>`: 31-bit unsigned integer number

**Response:** 
- `<sessionKey>`: A string representing a session (valid for 10 minutes)

**Example:**
```bash
curl http://localhost:8081/4711/login
# Response: UICSNDK
```

### Post User Bid
Posts a user's bid to an item. Can be called multiple times per user and item. Only requests with valid session keys are processed. Returns nothing on success.

**Request:**
```
POST /<itemID>/bid?sessionKey=<sessionKey>
```

**Parameters:**
- `<itemID>`: 31-bit unsigned integer
- `<sessionKey>`: A session key string retrieved from the login function

**Request Body:**
- `<bid>`: double

**Response:** (nothing)

**Example:**
```bash
curl -X POST "http://localhost:8081/2/bid?sessionkey=UICSNDK" \
     -H "Content-Type: text/plain" \
     -d "3.1"
```

### Get Top Bids for Item
Retrieves the top bids for a specific item. Returns a JSON array in descending bid order. Due to memory constraints, no more than 15 bids are returned per item. Only the highest bid per user counts - each user ID appears at most once in the list. If no bids have been submitted for an item, an empty string is returned.

**Request:**
```
GET /<itemID>/topBidList
```

**Parameters:**
- `<itemID>`: 31-bit unsigned integer

**Response:** 
- JSON array of `{"userID": "bid"}` objects, or empty string if no bids exist

**Example:**
```bash
curl http://localhost:8081/2/topBidList
# Response:
[
  {"23": "33.5"},
  {"467": "32.5"}
]
```
## Project Structure

```
.
├── Dockerfile              # Container configuration
├── jest.config.js          # Test configuration
├── Makefile               # Build and deployment commands
├── package.json           # Node.js dependencies
├── src/
│   ├── constants.ts       # Application constants
│   ├── controllers/       # Request handlers
│   │   └── auction.controller.ts
│   ├── index.ts          # Application entry point
│   ├── routes.ts         # API route definitions
│   ├── server.ts         # Express server setup
│   ├── services/         # Business logic
│   │   ├── auction.service.ts
│   │   ├── bids.service.ts
│   │   └── session.service.ts
│   └── types.ts          # TypeScript type definitions
├── tests/                # Unit tests
│   ├── auction.service.test.ts
│   ├── bids.service.test.ts
│   └── session.service.test.ts
└── tsconfig.json         # TypeScript configuration
```

## Requirements

- Docker
- Node.js 20+ (for development)
- `.env` file with PORT configuration

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/FelipeBelfort/auction_server.git
   cd auction-server
   ```

2. **Create environment file**
   ```bash
   echo "PORT=8081" > .env
   ```

3. **Build and run**
   ```bash
   make start
   ```

The server will be available at `http://localhost:8081`

### Development Mode

For development with live reload:

```bash
make dev
```

This runs the server in a container with volume mounting for real-time code changes.

## Available Commands

| Command | Description |
|---------|-------------|
| `make start` | Build and run the production container |
| `make build` | Build the Docker image |
| `make run` | Run the container (requires built image) |
| `make dev` | Run in development mode with live reload |
| `make test` | Run the test suite |
| `make shell` | Open a shell in the container |
| `make clean` | Stop and remove the container |
| `make fclean` | Clean containers and remove Docker image |
| `make rebuild` | Rebuild the image without cache |
| `make re` | Full clean and rebuild |

## Testing

Run the comprehensive test suite:

```bash
make test
```
You may need to run `npm install` before.

Tests cover:
- Auction service functionality
- Bidding logic and validation
- Session management and expiration

## Architecture

### Core Components

- **Session Service**: Manages user authentication and session expiration
- **Bids Service**: Handles bid storage and retrieval with memory optimization
- **Auction Service**: Orchestrates bidding operations and top bid calculations

### Performance Features

- **In-Memory Storage**: All data stored in memory for maximum speed
- **Efficient Data Structures**: Optimized for concurrent access
- **Session Cleanup**: Automatic cleanup of expired sessions
- **Memory Management**: Limits top bids to 15 per item to control memory usage

### Design Principles

- **Stateless Sessions**: Session keys are self-contained and verifiable
- **Concurrent Safety**: Thread-safe operations for simultaneous requests
- **Memory Efficiency**: Bounded memory usage with automatic cleanup
- **Ad-hoc Creation**: Users and items created automatically on first reference

## Configuration

Create a `.env` file in the project root:

```env
PORT=8081
```

## API Behavior Notes

- All successful requests return HTTP 200
- Failed requests return non-200 status codes
- Users and items are created automatically when first referenced
- Session keys are valid for exactly 10 minutes
- Only the highest bid per user counts in top bid lists
- Maximum 15 bids returned per item for memory efficiency
- Empty array returned for items with no bids

## Troubleshooting

### Container Issues
```bash
# Clean up all containers and images
make fclean

# Rebuild from scratch
make re
```

### Port Conflicts
```bash
# Check if port is in use
lsof -i :8081

# Update .env file with different port
echo "PORT=8082" > .env
```

