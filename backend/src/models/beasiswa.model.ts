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
  periode: string;
  status: boolean;
}

export class ReqPostBeasiswa {
  kode: string;
  nama: string;
  deskripsi: string;
  periode: string;
  status: boolean;
}

export class ReqDeleteBeasiswa {
  selected: string[];
}

export class BeasiswaResponse {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  periode: string;
  status: boolean;
  dibuatPada?: Date;
}
