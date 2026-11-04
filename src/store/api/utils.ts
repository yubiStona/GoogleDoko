export interface Place {
  id: string;
  name: string;
  origin: string;
  description: string;
  image: string;
  itemCount: number;
  soldCount: number;
  activeCategoriesCount: number;
}

export interface PlaceApiResponse {
  success: boolean;
  message: string;
  data: Place[];
}
