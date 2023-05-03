import React, { ReactNode, useEffect } from 'react';
import MediaCached from '../helper/downloader';

interface IMediaCacheProvider {
  maxProcess?: number;
  children?: ReactNode;
}

const MediaCacheProvider = (props: IMediaCacheProvider) => {
  useEffect(() => {
    MediaCached.setConfig({
      maxProcess: props.maxProcess,
    });
  }, [props.maxProcess]);

  useEffect(() => {
    return () => {
      MediaCached.pause();
    };
  }, []);
  return <>{props.children}</>;
};

export default MediaCacheProvider;
