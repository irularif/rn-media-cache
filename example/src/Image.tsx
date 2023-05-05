import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Image, ImagePreview } from 'rn-media-cache';

const { width } = Dimensions.get('screen');
const imageW = (width - 24 - 8 * 3) / 3;

const fetchImages = async ({ pageParam = 1 }) => {
  const res = await fetch(
    `https://api.unsplash.com/photos?per_page=30&page=${pageParam}`,
    {
      headers: {
        Authorization: 'Client-ID 5J390foJIdpav9L9QbzMHVrDDzBZIQFQo4ETOIxLq7E',
      },
    }
  );
  const data = await res.json();
  return data;
};

const ImageScreen = () => {
  const [scroll, setScroll] = useState(false);
  const { data, fetchNextPage, isFetching, isFetchingNextPage, refetch } =
    useInfiniteQuery(['images'], fetchImages, {
      getNextPageParam: (_, allPages) => allPages.length + 1,
    });

  const items = useMemo(() => {
    const _items = data?.pages?.reduce((prev: any[], curr: any[]) => {
      return [...prev, ...curr];
    }, []);
    return _items;
  }, [data?.pages]);

  return (
    <FlatList
      data={items}
      renderItem={(item) => <Item {...item} />}
      numColumns={3}
      contentContainerStyle={styles.list}
      onScrollBeginDrag={() => setScroll(true)}
      onEndReached={() => {
        if (scroll && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.1}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={() => refetch({ refetchPage: () => true })}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
};

const Item = ({ item }: ListRenderItemInfo<any>) => {
  // const source = 'https://loremflickr.com';
  // const uri = `${source}/1024/1024/beach?lock=${item}.jpg`;
  // const thumbnailUri = `${source}/200/200/beach?lock=${item}.jpg`;
  const uri = item.urls?.small;
  const thumbnailUri = item.urls?.thumb;

  return (
    <View style={styles.imageWrapper}>
      <ImagePreview>
        <Image
          thumbnailSource={{ uri: thumbnailUri }}
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          blurWhenLoading
        />
      </ImagePreview>
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
  loading: {
    padding: 30,
  },
});

export default ImageScreen;
