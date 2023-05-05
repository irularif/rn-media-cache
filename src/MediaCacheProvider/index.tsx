import React, { ReactNode, useEffect } from 'react';
import PreviewProvider from '../ImagePreview/PreviewProvider';
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

  return <PreviewProvider>{props.children}</PreviewProvider>;
};

export default MediaCacheProvider;
