# Cached Node Modules Action

This action caches Node.js modules to speed up workflows by avoiding unnecessary reinstallations.

## Features

- Caches `node_modules` directory for faster workflow runs
- Automatically installs dependencies if cache is not available
- Optionally builds packages after installation
- Uses composite action for better performance
- Simple configuration with sensible defaults

## Usage

```yaml
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js with cached modules
        uses: your-org/actions/.github/actions/cached-node-modules@main
        with:
          node-version: '22'
          
      # Your build and test steps follow here, with node_modules already available
```

## Inputs

| Input          | Description                                      | Required | Default          |
| -------------- | ------------------------------------------------ | -------- | ---------------- |
| `node-version` | Node.js version to use in the cache key          | No       | `'22'`           |
| `build`        | Whether to build the packages after installation | No       | `'true'`         |
| `cacheKey`     | Custom cache key to use                          | No       | `'node-modules'` |

## Outputs

| Output      | Description                      |
| ----------- | -------------------------------- |
| `cache-hit` | Whether the cache was hit or not |

## How It Works

1. Attempts to restore `node_modules` from cache using a key based on Node.js version and `package-lock.json` hash
2. If cache miss, runs `npm ci` to install dependencies
3. If `build` is set to true (default), runs `npm run build` if the script exists in package.json
4. Saves the `node_modules` folder to cache for future workflow runs
