import * as Crypto from 'expo-crypto';
import { Platform } from 'expo-modules-core';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  ImageSourcePropType,
  ImageProps as RNImageProps,
} from 'react-native';
import { Image as RNImage } from 'react-native';
import MediaCached from '../helper/downloader';

interface ImageProps extends RNImageProps {
  thumbnailSource?: ImageSourcePropType;
}

const Image = (props: ImageProps) => {
  const [uri, setUri] = useState('');
  const [progress, setProgress] = useState(0);

  const source = useMemo(() => {
    if (typeof props.source !== 'number') {
      if (!!uri) {
        return {
          uri,
        };
      }
      if (props.thumbnailSource) {
        return props.thumbnailSource;
      }
    }
    return props.source;
  }, [props.source, props.thumbnailSource, uri]);

  const blurRadius = useMemo(() => {
    const intensity = Platform.select({
      android: 1,
      ios: 15,
    });
    if (typeof props.source !== 'number') {
      if (uri) {
        return 0;
      }
      let _blurRadius = intensity - (progress / 100) * intensity;
      return _blurRadius;
    }
    return 0;
  }, [props.source, progress, uri]);

  useEffect(() => {
    let remove = () => {};
    if (typeof props.source === 'number') {
      setProgress(100);
    } else if (typeof props.source === 'object') {
      if (
        !Array.isArray(props.source) &&
        props.source.uri &&
        props.source.uri.includes('http')
      ) {
        remove = MediaCached.get({
          id: Crypto.randomUUID(),
          url: props.source.uri,
          onProgress: (progress) => {
            setProgress(progress);
          },
          onDone: (media) => {
            setProgress(100);
            setUri(media.path);
          },
        });
      }
    }

    return () => {
      remove?.();
    };
  }, []);

  return <RNImage {...props} source={source} blurRadius={blurRadius} />;
};

export default Image;
