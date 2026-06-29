export type CategoryMedia = {
  id?: string;
  url?: string;
  path?: string;
  fileUrl?: string;
  imageUrl?: string;
  filename?: string;
  key?: string;
};

export type CategoryImage = string | CategoryMedia;

export type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: CategoryImage;
  banner?: CategoryImage;
  iconUrl?: string;
  iconPath?: string;
  bannerUrl?: string;
  bannerPath?: string;
  imageUrl?: string;
  url?: string;
  path?: string;
};

export type CreateCategoryPayload = {
  name: string;
  description?: string;
};
