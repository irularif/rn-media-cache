import Constants from 'expo-constants';
import React from 'react';
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import Image from '../Image';
import {
  MediaPreviewAction,
  MediaPreviewType,
  MediaPreviewValue,
} from './store';
const statusBarHeight = Constants.statusBarHeight;

interface PreviewCarouselProps {
  mediaPreviewState: [MediaPreviewValue, React.Dispatch<MediaPreviewAction>];
}

const PreviewModal = (props: PreviewCarouselProps) => {
  const [preview, dispatch] = props.mediaPreviewState;
  const { visible, source, thumbnailSource } = preview;
  const { width, height } = Dimensions.get('screen');

  const onClose = () => {
    dispatch({
      type: MediaPreviewType.REMOVE,
      payload: undefined,
    });
  };

  if (!visible || !source) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onDismiss={onClose}
      onRequestClose={onClose}
      style={styles.modal}
      hardwareAccelerated
    >
      <StatusBar barStyle={'light-content'} />
      <ImageZoom
        cropWidth={width}
        cropHeight={height}
        imageWidth={width}
        imageHeight={height}
        style={styles.modal}
      >
        <Image
          source={source}
          thumbnailSource={thumbnailSource}
          blurWhenLoading
          style={{
            width,
            height,
          }}
          resizeMode="contain"
        />
      </ImageZoom>
      <TouchableOpacity onPress={onClose} style={styles.close}>
        <Text style={styles.text}>✕</Text>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#000',
  },
  close: {
    position: 'absolute',
    top: statusBarHeight,
    right: 0,
    marginHorizontal: 16,
    borderRadius: 46,
    height: 46,
    width: 46,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 0.5,
  },
  text: {
    color: '#000',
    fontWeight: '600',
    fontSize: 24,
    paddingTop: 4,
  },
});

export default PreviewModal;
