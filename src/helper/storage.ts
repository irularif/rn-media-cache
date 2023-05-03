import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  key: string = 'MediaCache';
  items: Record<string, any> = {};

  constructor() {
    this._initialize();
  }

  private async _initialize() {
    const datastr = await AsyncStorage.getItem(this.key);
    if (!!datastr) {
      const data = JSON.parse(datastr);
      this.items = data;
    }
  }

  private async save() {
    await AsyncStorage.setItem(this.key, JSON.stringify(this.items));
  }

  async set(key: string, value: any) {
    this.items[key] = value;
    await this.save();
  }

  get(key: string) {
    return this.items[key];
  }

  async remove(key: string) {
    delete this.items[key];
    await this.save();
  }
}

const MediaCachedStorage = new Storage();

export default MediaCachedStorage;
