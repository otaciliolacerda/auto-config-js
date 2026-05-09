# Example

This is a simple example on how to use `auto-config-js`. It loads the config files present in the config directory.

## Run

To run the examples you first need to link the package locally:

1. On the project root directory run:

```shell
npm link
```

2. On the `example/` directory run:

```shell
npm link auto-config-js
```

3. Run the JavaScript example:

```shell
node index.js
```

Or the TypeScript example (requires Node 22+, no compilation step needed):

```shell
node --experimental-strip-types index.ts
```

4. Expected output:

```js
{
  application: 'myDevApp',
  credentials: { directory: '/meta/credentials' },
  session: {
    cookie: { maxAge: 86400000, secure: true },
    secret: 'session_secret'
  }
}
```
