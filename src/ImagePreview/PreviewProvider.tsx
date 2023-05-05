import React, { ReactNode, useMemo, useReducer } from 'react';
import PreviewModal from './PreviewModal';
import {
  MediaPreviewActionContext,
  MediaPreviewType,
  MediaPreviewValue,
  mediaPreviewStore,
} from './store';

interface IMediaCacheProvider {
  maxProcess?: number;
  children?: ReactNode;
}

const PreviewProvider = (props: IMediaCacheProvider) => {
  const mediaPreviewState = useReducer(mediaPreviewStore, {
    visible: false,
    source: undefined,
    thumbnailSource: undefined,
  });
  const [_, dispatch] = mediaPreviewState;

  const actions = useMemo(() => {
    return {
      view: (image: Omit<MediaPreviewValue, 'visible'>) =>
        dispatch({
          type: MediaPreviewType.SET,
          payload: {
            visible: true,
            ...image,
          },
        }),
    };
  }, []);

  return (
    <MediaPreviewActionContext.Provider value={actions}>
      {props.children}
      <PreviewModal mediaPreviewState={mediaPreviewState} />
    </MediaPreviewActionContext.Provider>
  );
};

export default PreviewProvider;
