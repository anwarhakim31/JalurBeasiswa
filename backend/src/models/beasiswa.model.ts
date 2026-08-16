export class ReqGetAllBeasiswa {
  page?: number;
  search?: string;
  limit?: number;
  status?: string;
}

export class ReqPutBeasiswa {
  kode: string;
  nama: string;
  deskripsi: string;
  status: boolean;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

export class ReqPostBeasiswa {
  kode: string;
  nama: string;
  deskripsi: string;
  status: boolean;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

export class ReqDeleteBeasiswa {
  selected: string[];
}

export class BeasiswaResponse {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: boolean;
  publikasi?: boolean;
  dibuatPada?: Date;
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
}
