export interface IProduct {
    _id: string;
    title: string;
    shortDescription: string;
    price: string;
    oldPrice?: string;
    dicountPercentage?: string;
    isNew?: boolean;
    productImage: string;
    freeDelivery?: boolean; // Add freeDelivery property
  }
  
  export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  