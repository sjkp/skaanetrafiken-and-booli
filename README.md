# Skånetrafiken CLI

A command-line tool for planning trips using the Skånetrafiken public transit API.

## Features

- Search for locations by address or station name
- Plan journeys between two locations
- View detailed route information including:
  - Departure and arrival times
  - Journey duration
  - Number of transfers
  - Line numbers and directions
  - Walking segments

## Requirements

- Node.js 18 or later (for native fetch support)

## Installation

No dependencies required! Just clone and run.

```bash
npm install
```

## Usage

```bash
node index.js <from-address> <to-address> [departure-time]
```

### Arguments

- `<from-address>` - Starting location (address or station name)
- `<to-address>` - Destination (address or station name)
- `[departure-time]` - Optional departure time in ISO format (defaults to current time)

### Examples

#### Basic usage
```bash
node index.js "Malmö Hyllie" "Lund C"
```

#### With specific departure time
```bash
node index.js "Hyllie" "Lund Central" "2025-12-20T14:30"
```

#### Using addresses
```bash
node index.js "Malmö Central" "Helsingborg C"
```

## Output Example

```
Searching for "Malmö Hyllie"...
✓ Found: Malmö Hyllie (STOP_AREA)
Searching for "Lund C"...
✓ Found: Lund C (STOP_AREA)

Planning journey...

================================================================================
Journey from "Malmö Hyllie" to "Lund C"
================================================================================

Trip 1:
  Departure: 12:33
  Arrival:   12:52
  Duration:  19m
  Changes:   0
  Route:
    1. Öresundståg 1062 mot Helsingborg C
       12:33 Malmö Hyllie → 12:52 Lund C
```

## API Information

This tool uses the Skånetrafiken public API (`https://www.skanetrafiken.se/gw-tps/api/v2`).

### Endpoints Used

- `GET /Points` - Search for locations/stops
- `GET /Journey` - Plan trips between locations

### Key Parameters

The Journey API accepts:
- `fromPointId` / `toPointId` - Location IDs or coordinates
- `fromPointType` / `toPointType` - STOP_AREA or LOCATION
- `priority` - SHORTEST_TIME (default)
- `walkSpeed` - NORMAL (default)
- `maxWalkDistance` - Maximum walking distance in meters (2000 default)

## License

MIT
