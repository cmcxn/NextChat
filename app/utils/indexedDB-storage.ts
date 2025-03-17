import { StateStorage } from "zustand/middleware";
import { createStore, get, set, del, clear } from "idb-keyval";
import { safeLocalStorage } from "@/app/utils";
const localStorage = safeLocalStorage();

class IndexedDBStorage implements StateStorage {
  private store;

  constructor(userName: any) {
    if (typeof window != "undefined") {
      this.store = createStore(`${userName}-database`, "user-store");
    }
  }

  public async getItem(name: string): Promise<string | null> {
    try {
      const value = (await get(name, this.store)) || localStorage.getItem(name);
      return value;
    } catch (error) {
      return localStorage.getItem(name);
    }
  }

  public async setItem(name: string, value: string): Promise<void> {
    try {
      const _value = JSON.parse(value);
      if (!_value?.state?._hasHydrated) {
        console.warn("skip setItem", name);
        return;
      }
      await set(name, value, this.store);
    } catch (error) {
      localStorage.setItem(name, value);
    }
  }

  public async removeItem(name: string): Promise<void> {
    try {
      await del(name, this.store);
    } catch (error) {
      localStorage.removeItem(name);
    }
  }

  public async clear(): Promise<void> {
    try {
      await clear(this.store);
    } catch (error) {
      localStorage.clear();
    }
  }
}
export const indexedDBStorage = new IndexedDBStorage(
  localStorage.getItem("username"),
);
