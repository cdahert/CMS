/**
 * Global type definitions
 */

/** API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Base entity */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Select option */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/** Navigation item */
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
}
