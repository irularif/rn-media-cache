import React, { useMemo } from 'react';

import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { Image, MediaCacheProvider } from 'rn-media-cache';

const { width } = Dimensions.get('screen');
const imageW = (width - 24 - 8 * 3) / 3;

export default function App() {
  const items = useMemo(() => {
    let _items = [];
    for (let index = 1; index <= 100; index++) {
      _items.push(index);
    }
    return _items;
  }, []);

  return (
    <MediaCacheProvider maxProcess={8}>
      <FlatList
        data={items}
        renderItem={(item) => <Item {...item} />}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </MediaCacheProvider>
  );
}

const Item = ({ item }: ListRenderItemInfo<number>) => {
  const source = 'https://loremflickr.com';
  const uri = `${source}/1024/1024/beach?lock=${item}.jpg`;
  const thumbnailUri = `${source}/200/200/beach?lock=${item}.jpg`;

  return (
    <View style={styles.imageWrapper}>
      <Image
        thumbnailSource={{ uri: thumbnailUri }}
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  imageWrapper: {
    padding: 4,
  },
  image: {
    borderRadius: 8,
    width: imageW,
    height: imageW,
  },
});
