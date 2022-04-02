# Example

This is a simple example on how to use `auto-config-js`. It loads the config files present in the config directory. 

## Run
To run the example you first need to symlink the package folder:

1. On the project root directory run

```shell
yarn link
```
 
2. On the `example/` directory run:

```shell
yarn link auto-config-js
yarn example
```

3. Expected output:

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
