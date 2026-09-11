# CircleCI Configuration Example

Use this example as a starting point when adding `node-lifecycle` to a CircleCI pipeline.

## Without Installing the Package

This option fetches the latest published version from npm with `npx`:

```yaml
version: 2.1

jobs:
  check-node-lifecycle:
    docker:
      - image: cimg/node:24.3
    steps:
      - checkout
      - run:
          name: Check Node.js lifecycle
          command: npx node-lifecycle --warn-days=180

workflows:
  verify:
    jobs:
      - check-node-lifecycle
```

## With a Local Dependency

If `node-lifecycle` is listed in your project's `devDependencies`, install it with
the rest of the project dependencies and run its binary:

```yaml
version: 2.1

jobs:
  check-node-lifecycle:
    docker:
      - image: cimg/node:24.3
    steps:
      - checkout
      - run: npm ci
      - run:
          name: Check Node.js lifecycle
          command: npx node-lifecycle --warn-days=180

workflows:
  verify:
    jobs:
      - check-node-lifecycle
```

Adjust the `--warn-days` value and Node.js image version to fit your project.