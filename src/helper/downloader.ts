import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import getFileSize from './getFileSize';
import MediaCachedStorage from './storage';
import { waitUntil } from './waitUntil';

type TMediaCacheStatus = 'initialize' | 'run' | 'pause' | 'complete';
type TMediaItemStatus =
  | 'initialize'
  | 'queue'
  | 'downloading'
  | 'pause'
  | 'error'
  | 'done';

interface IMediaConfig extends FileSystem.DownloadOptions {
  id: string;
  url: string;
  path?: string;
  immedietely?: boolean;
  onProgress?: (progress: number) => void;
  onDone?: (media: Omit<MediaItem, 'config'>) => void;
  onError?: (error: Error, media: Omit<MediaItem, 'config'>) => void;
}

interface IMediaCacheConfig {
  maxProcess?: number;
}

const dirs = FileSystem.cacheDirectory + 'media/';

class MediaItem {
  id: string = '';
  createdAt: string = new Date().toJSON();
  updatedAt: string = new Date().toJSON();
  url: string = '';
  path: string = '';
  progress: number = 0;
  status: TMediaItemStatus = 'initialize';
  error?: Error;

  private _configs: Record<string, Partial<IMediaConfig>> = {};
  private _downloadRef?: FileSystem.DownloadResumable;

  constructor(config: IMediaConfig) {
    this.id = Crypto.randomUUID();
    this.url = config.url;
    this.path = dirs + encodeURIComponent(config.url.split('/').pop() || '');
    this._configs[this.id] = config;
    this.initilize(config?.immedietely);
  }

  private get media() {
    const filtered = Object.keys(this)
      .filter(
        (key) => !key.includes('_') || typeof (this as any)[key] !== 'function'
      )
      .reduce((obj: any, key) => {
        obj[key] = (this as any)[key];
        return obj;
      }, {});
    return filtered;
  }

  private async initilize(immedietely: boolean = true) {
    const res = await FileSystem.getInfoAsync(this.path);
    if (res.exists) {
      const fileSize = await getFileSize(this.url);
      if (res.size && res.size === fileSize) {
        this.status = 'done';
        this.runCallback();
        return;
      }
    }
    const downloadSnapshot = await MediaCachedStorage.get(this.id);
    if (downloadSnapshot) {
      this._downloadRef = new FileSystem.DownloadResumable(
        downloadSnapshot.url,
        downloadSnapshot.fileUri,
        downloadSnapshot.options,
        (downloadProgress: FileSystem.DownloadProgressData) => {
          const progress =
            (downloadProgress?.totalBytesWritten /
              downloadProgress?.totalBytesExpectedToWrite) *
            100;
          this.progress = progress;
          this.runCallbackProgress(progress);
        },
        downloadSnapshot.resumeData
      );
      this.status = 'queue';
    }
    if (
      immedietely &&
      (this.status === 'initialize' || this.status === 'error')
    ) {
      this.status = 'queue';
    }
  }

  private runCallback() {
    Promise.all(
      Object.keys(this._configs)
        .filter((x) => x !== this.id)
        .map(async (id) => {
          if (this.status === 'done') {
            let customPath = this._configs[id]?.path;
            if (customPath) {
              try {
                const res = await FileSystem.getInfoAsync(customPath);
                if (!res.exists) {
                  await FileSystem.copyAsync({
                    from: this.path,
                    to: customPath,
                  });
                }
              } catch (error) {
                console.warn(error);
                customPath = this.path;
              }
            } else {
              customPath = this.path;
            }
            this._configs[id]?.onDone?.({ ...this.media, path: customPath });
          } else {
            this._configs[id]?.onError?.(
              this.error || new Error('Media cache unknown error.'),
              this.media
            );
          }
          delete this._configs[id];
        })
    );
  }

  private async runCallbackProgress(progress: number) {
    await Promise.all(
      Object.keys(this._configs)
        .filter((x) => x !== this.id)
        .map(async (id) => {
          this._configs[id]?.onProgress?.(progress);
        })
    );
  }

  async addConfig(config: IMediaConfig) {
    let id = config.id || Crypto.randomUUID();
    this._configs[id] = {
      ...config,
    };
    if (this.status === 'done') {
      let customPath = this._configs[id]?.path;
      if (customPath) {
        try {
          await FileSystem.copyAsync({
            from: this.path,
            to: customPath,
          });
        } catch (error) {
          console.warn(error);
          customPath = this.path;
        }
      } else {
        customPath = this.path;
      }
      this._configs[id]?.onDone?.({ ...this.media, path: customPath });
    }
  }

  async donwload() {
    const { id, url, path, _configs } = this;
    try {
      this.status = 'downloading';
      let ref = FileSystem.createDownloadResumable(
        url,
        path,
        _configs[id],
        (downloadProgress: FileSystem.DownloadProgressData) => {
          const progress =
            (downloadProgress?.totalBytesWritten /
              downloadProgress?.totalBytesExpectedToWrite) *
            100;
          this.progress = progress;
          this.runCallbackProgress(progress);
        }
      );
      let result = undefined;
      if (!!this._downloadRef) {
        ref = this._downloadRef;
        result = await ref.resumeAsync();
      } else {
        this._downloadRef = ref;
        result = await ref.downloadAsync();
      }

      if (result && result.status >= 200 && result.status < 300 && result.uri) {
        this.error = undefined;
        this.status = 'done';
      } else {
        throw new Error(`Error status code ${result?.status}`);
      }
    } catch (error: any) {
      this.status = 'error';
      this._downloadRef = undefined;
      this.error = error;
    } finally {
      MediaCachedStorage.remove(this.id);
      this.runCallback();
    }
  }

  pause() {
    this.status = 'pause';
    this._downloadRef?.pauseAsync();
    MediaCachedStorage.set(this.id, this._downloadRef?.savable());
  }

  removeCallback(id: string) {
    delete this._configs[id];
  }
}

class MediaCache {
  status: TMediaCacheStatus = 'initialize';
  items: Array<MediaItem> = [];
  maxProcess: number = 5;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const res = await FileSystem.getInfoAsync(dirs);
    if (!res.exists) {
      await FileSystem.makeDirectoryAsync(dirs, {
        intermediates: true,
      });
    }
  }

  private get waiting() {
    return this.items.filter((x) => x.status === 'initialize');
  }

  private get queue() {
    return this.items.filter((x) => x.status === 'queue');
  }

  private get downloading() {
    return this.items.filter((x) => x.status === 'downloading');
  }

  private get paused() {
    return this.items.filter((x) => x.status === 'pause');
  }

  async run() {
    if (this.status === 'pause') {
      return;
    }
    const countPaused = this.paused.length;
    if (countPaused) {
      this.paused.forEach((item) => {
        item.donwload();
      });
    }
    const countWaiting = this.waiting.length;
    const countQueue = this.queue.length;
    const countDownloading = this.downloading.length;
    let canDownloadNum = this.maxProcess - countDownloading;
    if (canDownloadNum > countQueue) {
      canDownloadNum = countQueue;
    }
    if (!canDownloadNum && !countDownloading && !countQueue && !countWaiting) {
      this.status = 'complete';
      return;
    }
    if (this.status !== 'run') {
      this.status = 'run';
    }
    await waitUntil(
      () =>
        !!canDownloadNum ||
        !!this.waiting.length ||
        (!canDownloadNum && !!this.queue.length) ||
        (!!this.downloading.length &&
          this.downloading.length < this.maxProcess) ||
        (!this.downloading.length && !this.queue.length),
      100
    );
    if (canDownloadNum) {
      this.queue.slice(0, canDownloadNum).forEach((item) => {
        item.donwload();
      });
    }
    this.run();
  }

  private findOrCreateItem(config: IMediaConfig) {
    let media = this.items.find((x) => x.url === config.url);
    if (!media) {
      this.items.push(new MediaItem(config));
      media = this.items.find((x) => x.url === config.url);
    }
    media?.addConfig(config);
    return media;
  }

  get(config: IMediaConfig) {
    const res = this.findOrCreateItem(config);
    if (this.status !== 'run') {
      this.run();
    }

    return () => {
      res?.removeCallback(config.id);
    };
  }

  cancel(id: string) {
    this.items.forEach((item) => {
      item.removeCallback(id);
    });
  }

  pause() {
    if (this.status === 'complete') {
      return;
    }
    this.status = 'pause';
    this.downloading.map((item) => {
      item.pause();
    });
  }

  setConfig({ maxProcess }: IMediaCacheConfig) {
    if (maxProcess) {
      this.maxProcess = maxProcess;
    }
  }
}

const MediaCached = new MediaCache();

export default MediaCached;
