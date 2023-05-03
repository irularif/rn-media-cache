const getFileSize = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const contentLength = response.headers.get('Content-Length') || '0';
    const fileSizeInBytes = parseInt(contentLength, 10);
    return fileSizeInBytes;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getFileSize;
