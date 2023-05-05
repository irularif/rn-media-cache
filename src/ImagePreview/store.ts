import { createContext } from 'react';
import type { ImageSourcePropType } from 'react-native';

export enum MediaPreviewType {
  SET,
  REMOVE,
}

export interface MediaPreviewValue {
  visible: boolean;
  source?: ImageSourcePropType;
  thumbnailSource?: ImageSourcePropType;
}

export interface MediaPreviewAction {
  type: MediaPreviewType;
  payload?: MediaPreviewValue;
}

export const mediaPreviewStore = (
  state: MediaPreviewValue,
  action: MediaPreviewAction
) => {
  switch (action.type) {
    case MediaPreviewType.SET:
      return {
        visible: true,
        source: action.payload?.source,
        thumbnailSource: action.payload?.thumbnailSource,
      };
    case MediaPreviewType.REMOVE:
      return {
        visible: false,
        source: undefined,
        thumbnailSource: undefined,
      };
    default:
      return state;
  }
};

interface IAction {
  view: (image: Omit<MediaPreviewValue, 'visible'>) => void;
}

export const MediaPreviewActionContext = createContext<IAction | undefined>(
  undefined
);
