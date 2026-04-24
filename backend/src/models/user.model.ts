export class ReqEditUser {
  fullname?: string;
  photo?: string;
  email: string;
}

export class ReqEditPassword {
  password: string;
  newPassword: string;
}

export class ReqGetAllUser {
  page?: number;
  search?: string;
  limit?: number;
  status?: string;
}

export class ReqPutPengguna {
  fullname?: string;
  photo?: string;
  email: string;
  status: string;
  nim: string;
  prodi?: string;
  batch?: number;
  password?: string;
}

export class ReqPostPengguna {
  fullname?: string;
  photo?: string;
  email: string;
  status: string;
  nim: string;
  prodi?: string;
  batch?: number;
  password: string;
}

export class ReqDeletePengguna {
  selected: string[];
}

export class UserResponse {
  nim: string;
  email: string;
  status?: string;
  fullname?: string;
  createdAt?: Date;
  photo?: string;
}
