# GitHub Actions Configuration Example

Use this example as a starting point when adding `node-lifecycle` to a GitHub Actions workflow in `.github/workflows/`.

Add this job to a workflow with your desired triggers to fail if Node.js is near or past EOL:

```yaml
jobs:
  check-node-lifecycle:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version-file: '.nvmrc'

      - run: npx --yes node-lifecycle
```

This example uses the Node.js version specified by the repository's `.nvmrc` file. 

To check a specific version, pass `--version=X.Y.Z`. Adjust the warning window with `--warn-days=N` (default: 180).
