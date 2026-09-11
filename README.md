# node-lifecycle

A lightweight Node.js EOL checker and lifecycle CLI.

Check whether your current or specified Node.js version is **Current**, **Active LTS**, **Maintenance**, approaching **end-of-life (EOL)**, or already **EOL**.

Use `node-lifecycle` locally or in CI to identify unsupported Node.js versions and get advance warning before a version reaches end-of-life.

[![npm version](https://img.shields.io/npm/v/node-lifecycle.svg)](https://www.npmjs.com/package/node-lifecycle)
[![npm downloads](https://img.shields.io/npm/dm/node-lifecycle.svg)](https://www.npmjs.com/package/node-lifecycle)
[![CI](https://github.com/ksalguera/node-lifecycle/actions/workflows/ci.yml/badge.svg)](https://github.com/ksalguera/node-lifecycle/actions/workflows/ci.yml)
[![Socket](https://badge.socket.dev/npm/package/node-lifecycle)](https://socket.dev/npm/package/node-lifecycle)
[![license](https://img.shields.io/npm/l/node-lifecycle.svg)](LICENSE)

## 📦 Installation

### Run without installing

For a quick lifecycle check:

```bash
npx node-lifecycle
```

### Global installation

Install the CLI globally:

```bash
npm install -g node-lifecycle
```

Then run:

```bash
node-lifecycle
```

### Project installation

Install `node-lifecycle` as a development dependency:

```bash
npm install --save-dev node-lifecycle
```

Run it with:

```bash
npx node-lifecycle
```

Or add it to your npm scripts:

```json
{
  "scripts": {
    "check-node": "node-lifecycle"
  }
}
```

Then run:

```bash
npm run check-node
```

## 🚀 Usage

Check the lifecycle status of your current Node.js version:

```bash
node-lifecycle
```

Check a specific Node.js version:

```bash
node-lifecycle --version=22.0.0
```

Use a custom EOL warning window:

```bash
node-lifecycle --warn-days=90
```

```bash
node-lifecycle --version=18.20.4 --no-fail
```

## ⚙️ Options

| Flag | Description |
| --- | --- |
| `--version=VER` | Check a specific Node.js version instead of the current runtime. |
| `--warn-days=N` | Warn if EOL is within `N` days (default: `180`). |
| `--cache-ttl=SECS` | Cache the Node.js release schedule for `N` seconds (default: `86400` / 24 hours). |
| `--no-fail` | Do not exit with code `2` when the version is EOL. |
| `--help` | Show the help message. |

## 🔄 Exit Codes

`node-lifecycle` uses exit codes so it can be used in scripts and CI pipelines.

| Code | Meaning |
| --- | --- |
| `0` | Supported, or EOL when `--no-fail` is used |
| `1` | Warning — version is within `warn-days` of EOL |
| `2` | Node.js version has reached EOL |

## 🧪 CI Integration

`node-lifecycle` can be used in CI to detect unsupported or soon-to-be-unsupported Node.js versions.

### GitHub Actions

See the [GitHub Actions configuration example](documentation/github-actions-config-example.md).

### CircleCI

See the [CircleCI configuration example](documentation/circleci-config-example.md).

## 📄 License

MIT © 2026 Kelsey Salguera

---

`node-lifecycle` retrieves Node.js release lifecycle information from the Node.js Release schedule and endoflife.date, with local caching for faster subsequent checks.
