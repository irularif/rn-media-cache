import React, { ReactElement, useContext } from 'react';
import type { TouchableOpacityProps } from 'react-native';
import { TouchableOpacity } from 'react-native';
import type { ImageProps } from '../Image';
import { MediaPreviewActionContext } from './store';

interface ImagePreviewProps extends TouchableOpacityProps {
  children: ReactElement<ImageProps>;
}

const ImagePreview = (props: ImagePreviewProps) => {
  const mediaAction = useContext(MediaPreviewActionContext);

  const { source, thumbnailSource } = props.children.props;

  const openCarousel = () => {
    mediaAction?.view({
      source,
      thumbnailSource,
    });
  };

  return <TouchableOpacity {...props} onPress={openCarousel} />;
};

export default ImagePreview;
