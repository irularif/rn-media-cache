# rn-media-cache

React Native Media Cache

## Installation

```sh
npm install rn-media-cache
```

## Usage

```js
import { MediaCacheProvider } from 'rn-media-cache';

// ...

<MediaCacheProvider>
    // ...
</MediaCacheProvider>
```

```js
import { Image } from 'rn-media-cache';

// ...

<Image
    thumbnailSource={{ uri: thumbnailUri }}
    source={{ uri }}
    style={styles.image}
    resizeMode="cover"
/>
```


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
