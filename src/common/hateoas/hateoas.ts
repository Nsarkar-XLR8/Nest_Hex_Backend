export type Link = {
  rel: string;
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  type?: string;
};

export type HateoasResponse<T> = {
  data: T;
  links: Link[];
  meta?: Record<string, unknown>;
};

export const createLink = (link: Link): Link => link;

export const buildResponse = <T>(data: T, links: Link[], meta?: Record<string, unknown>): HateoasResponse<T> => ({
  data,
  links,
  ...(meta ? { meta } : {}),
});
