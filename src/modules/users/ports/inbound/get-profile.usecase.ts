export interface GetProfileResult {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface GetProfileUseCase {
  execute(userId: string): Promise<GetProfileResult>;
}
