# node-lifecycle

Check the lifecycle status (Current, Active LTS, Maintenance, or EOL) of any Node.js version.

[![npm version](https://img.shields.io/npm/v/node-lifecycle.svg)](https://www.npmjs.com/package/node-lifecycle)
[![license](https://img.shields.io/npm/l/node-lifecycle.svg)](LICENSE)


---

## 📦 Installation

### Option 1: Global install (CLI available anywhere)
```
npm install -g node-lifecycle
```

After this, you can run the CLI directly:

```
node-lifecycle
```

### Option 2: Local install (in your project)

```
npm install --save-dev node-lifecycle
```

With a local install, binaries live in `node_modules/.bin`.

You can run it in one of two ways:

Use npx (simple):

```
npx node-lifecycle
```

OR: 

Add an npm script:
```
"scripts": {
  "check-node": "node-lifecycle"
}
```

Then run:
```
npm run check-node
```

### Option 3: Run without installing at all

```
npx node-lifecycle
```

This will fetch the latest version from npm on demand.

### Option 4: CircleCI configuration example

See the [CircleCI configuration example](documentation/circleci-config-example.md).

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


## 🧪 CI Integration and GitHub Actions

### GitHub Actions

See the [GitHub Actions configuration example](documentation/github-actions-config-example.md).


## 📄 License

MIT © 2026 Kelsey Salguera

Note: This tool fetches Node.js release schedules from official sources (nodejs/Release and endoflife.date) and caches them locally for faster performance.
