export interface CatBreed {
  id: string;
  name: string;
  subtitle: string;
  image?: string;
  origin?: string;
  temperament?: string;
  description?: string;
  life_span?: string;
  wikipedia_url?: string;
  alt_names?: string;

  intelligence?: number;
  affection_level?: number;
  energy_level?: number;
  adaptability?: number;
  child_friendly?: number;
  dog_friendly?: number;
  stranger_friendly?: number;
  rare?: number;
  weight_metric?: string;
}

export interface CatImage {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

export interface CatBreedTableRow {
  id: string;
  name: string;
  origin?: string;
  intelligence?: number;
  affection_level?: number;
  energy_level?: number;
  child_friendly?: number;
  dog_friendly?: number;
  rare?: number;
  life_span?: string;
  weight_metric?: string;
}

export type CatsBreedsResponse = {
  data: CatBreed[];
  total: number;
  page: number;
  limit: number;
};
