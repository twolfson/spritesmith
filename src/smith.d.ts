import { BufferFile } from 'vinyl';

export type SpritesmithOptions = {
  engine?: string;
  engineOpts?: Record<string, unknown>;
};

export type SpritesmithCreateImagesSrc = (string | BufferFile)[];
export type SpritesmithImage = {
  width: number;
  height: number;
  [key: string]: unknown;
};

export type SpritesmithProcessImagesOptions = {
  padding?: number;
  exportOpts?: {
    format?: 'png' | 'jpg' | 'jpeg' | 'webp';
    quality?: number;
    background?: string;
    [key: string]: unknown;
  };
  algorithm?: 'top-down' | 'left-right' | 'diagonal' | 'alt-diagonal' | 'binary-tree';
  algorithmOpts?: {
    sort?: boolean;
  };
};

export type SpritesmithResult = {
  image: ReadableStream;
  coordinates: Record<string, { x: number; y: number; width: number; height: number }>;
  properties: { width: number; height: number };
};

export default class Spritesmith {
  constructor(options?: SpritesmithOptions);
  static run(
    options: SpritesmithOptions & SpritesmithProcessImagesOptions & {
      src: SpritesmithCreateImagesSrc;
    },
    callback: (err: Error | null, result: SpritesmithResult) => void): void;
  createImages(src: SpritesmithCreateImagesSrc, callback: (err: Error | null, images: SpritesmithImage[]) => void): void;
  processImages(
    images: SpritesmithImage[],
    options?: SpritesmithProcessImagesOptions
  ): SpritesmithResult;
}