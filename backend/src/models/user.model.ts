export class ReqEditUser {
  namaLengkap?: string;
  prodi?: string;
  angkatan?: number;
  foto?: string;
  email: string;
}

export class ReqEditkataSandi {
  kataSandi: string;
  kataSandiBaru: string;
}

export class ReqGetAllUser {
  page?: number;
  search?: string;
  limit?: number;
  status?: string;
}

export class ReqPutPengguna {
  namaLengkap?: string;
  foto?: string;
  email: string;
  status: string;
  nim: string;
  prodi?: string;
  angkatan?: number;
  kataSandi?: string;
}

export class ReqPostPengguna {
  namaLengkap?: string;
  foto?: string;
  email: string;
  status: string;
  nim: string;
  prodi?: string;
  angkatan?: number;
  kataSandi: string;
}

export class ReqDeletePengguna {
  selected: string[];
}

export class UserResponse {
  nim: string;
  email: string;
  status?: string;
  namaLengkap?: string;
  prodi?: string;
  angkatan?: number;
  dibuatPada?: Date;
  foto?: string;
}
