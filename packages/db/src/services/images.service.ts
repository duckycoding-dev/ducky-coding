import { ImageDTO } from '@ducky-coding/types/DTOs';
import { ImagesRepository } from '../repositories/images.repository';

const getImage = async (imageId: number): Promise<ImageDTO | undefined> => {
  const selectedImages = await ImagesRepository.getImages([imageId]);
  if (selectedImages.length === 0) return undefined;

  const imageDTO: ImageDTO = selectedImages[0];
  return imageDTO;
};

const getImageByPath = async (path: string): Promise<ImageDTO | undefined> => {
  const selectedImages = await ImagesRepository.getImagesByPaths([path]);
  if (selectedImages.length === 0) return undefined;

  const imageDTO: ImageDTO = selectedImages[0];
  return imageDTO;
};

const getImages = async (imageIds: number[]): Promise<ImageDTO[]> => {
  const selectedImages = await ImagesRepository.getImages(imageIds);
  return selectedImages;
};

const getImagesByPaths = async (paths: string[]): Promise<ImageDTO[]> => {
  const selectedImages = await ImagesRepository.getImagesByPaths(paths);
  return selectedImages;
};

const getAllImages = async (): Promise<ImageDTO[]> => {
  const selectedImages = await ImagesRepository.getAllImages();
  return selectedImages;
};

export const ImagesService = {
  getImage,
  getImageByPath,
  getImages,
  getImagesByPaths,
  getAllImages,
};

// Add more methods as needed
