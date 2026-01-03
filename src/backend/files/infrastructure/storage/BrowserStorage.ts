import type { Storage } from "../../@core-contracts/storage";

interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  removeEntry(name: string): Promise<void>;
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}

export class BrowserStorage implements Storage {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    if (!this.directoryHandle) {
      await this.initializeDirectory();
    }

    const fileHandle = await this.directoryHandle!.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    
    await writable.write(file);
    await writable.close();
    
    return fileName;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!this.directoryHandle) {
      return false;
    }

    try {
      await this.directoryHandle.removeEntry(fileUrl);
      return true;
    } catch (error) {
      if ((error as DOMException).name === 'NotFoundError') {
        return true; // File already doesn't exist
      }
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async loadFileBuffer(fileName: string): Promise<Buffer> {
    if (!this.directoryHandle) {
      throw new Error('Directory not initialized');
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    }
  }

  private async initializeDirectory(): Promise<void> {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API not supported in this browser');
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') {
        throw new Error('User cancelled directory selection');
      }
      throw error;
    }
  }

  async setDirectory(): Promise<void> {
    await this.initializeDirectory();
  }
}