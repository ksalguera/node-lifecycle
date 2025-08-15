# node-lifecycle

Check the lifecycle status (Current, Active LTS, Maintenance, or EOL) of any Node.js version — right from your terminal.

[![npm version](https://img.shields.io/npm/v/node-lifecycle.svg)](https://www.npmjs.com/package/node-lifecycle)
[![license](https://img.shields.io/npm/l/node-lifecycle.svg)](LICENSE)


---

## 📦 Installation

Install globally to use the CLI anywhere:

```bash
npm install -g node-lifecycle
```

Or run without installing globally:

```
npx node-lifecycle
```

## 🚀 Usage

Check the status of your current Node.js version:

```
node-lifecycle
```

Check the status of a specific version:

```
node-lifecycle --version=18.20.4
```

## ⚙️ Options

| Flag               | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `--version=VER`    | Check this specific Node.js version instead of your current runtime.              |
| `--warn-days=N`    | Warn if EOL is within `N` days (default: `180`).                                  |
| `--cache-ttl=SECS` | Cache the Node.js release schedule for `N` seconds (default: `86400` / 24 hours). |
| `--no-fail`        | Do not exit with code `2` on EOL (still prints ❌).                               |
| `--help`           | Show help message.                                                                |

## 📋 Examples

Check a Node version close to EOL:

```
node-lifecycle --version=20.5.0
```

Use a shorter warning window:

```
node-lifecycle --warn-days=30
```

Check with no failure on EOL (useful for CI logs):

```
node-lifecycle --version=18.20.4 --no-fail
```

## Exit Codes

| Code | Meaning                                    |
| ---- | ------------------------------------------ |
| `0`  | OK (supported)                             |
| `1`  | Warning (within `warn-days` of EOL)        |
| `2`  | EOL (unless `--no-fail` is used, then `0`) |


## 🧪 CI Integration

Example GitHub Actions job to fail if Node.js is near or past EOL:

```
jobs:
  check-node-lifecycle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g node-lifecycle
      - run: node-lifecycle
```

## 📄 License

MIT © 2025 Kelsey Salguera

Note: This tool fetches Node.js release schedules from official sources (nodejs/Release and endoflife.date) and caches them locally for faster performance.