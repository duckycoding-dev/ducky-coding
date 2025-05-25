import type { Image, InsertImage } from './images.model';
import { ImagesRepository } from './images.repository';

const getImage = async (imageId: number): Promise<Image | undefined> => {
  const selectedImages = await ImagesRepository.getImages([imageId]);
  return selectedImages[0];
};

const getImageByPath = async (path: string): Promise<Image | undefined> => {
  const selectedImages = await ImagesRepository.getImagesByPaths([path]);
  return selectedImages[0];
};

const getImages = async (imageIds: number[]): Promise<Image[]> => {
  const selectedImages = await ImagesRepository.getImages(imageIds);
  return selectedImages;
};

const getImagesByPaths = async (paths: string[]): Promise<Image[]> => {
  const selectedImages = await ImagesRepository.getImagesByPaths(paths);
  return selectedImages;
};

const getAllImages = async (): Promise<Image[]> => {
  const selectedImages = await ImagesRepository.getAllImages();
  return selectedImages;
};

const upsertImage = async (
  image: InsertImage,
): Promise<InsertImage | undefined> => {
  const upsertedImages = await ImagesRepository.upsertImage([image]);
  if (upsertedImages[0] === undefined) return undefined; // throw new Error('Failed to upsert image');
  return upsertedImages[0];
};

export const ImagesService = {
  getImage,
  getImageByPath,
  getImages,
  getImagesByPaths,
  getAllImages,

  upsertImage,
};
