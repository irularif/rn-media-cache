import React, { useMemo } from 'react';

import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'rn-media-cache';

const { width } = Dimensions.get('screen');
const imageW = (width - 24 - 8 * 3) / 3;

const VideoScreen = () => {
  const items = useMemo(() => {
    let _items = [];
    for (let index = 1; index <= 100; index++) {
      _items.push(index);
    }
    return _items;
  }, []);

  return (
    <>
      <Image
        source={{
          uri: 'https://picsum.photos/id/237/200/300',
        }}
      >
        <Text>Test</Text>
      </Image>
      {/* <FlatList
        data={items}
        renderItem={(item) => <Item {...item} />}
        numColumns={3}
        contentContainerStyle={styles.list}
      /> */}
    </>
  );
};

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

export default VideoScreen;
