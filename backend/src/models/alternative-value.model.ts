export class KRITERIAVALUE {
  kriteriaCode: string;
  value: number;
}
export class ReqGetAllAlternativeValue {
  page?: number;
  search?: string;
  limit?: number;
  alternativeCode?: string;
  kriteriaCode?: string;
}

export class ReqPutAlternativeValue {
  alternativeCode: string;
  values: KRITERIAVALUE[];
}

export class ReqPostAlternativeValue {
  alternativeCode: string;
  values: KRITERIAVALUE[];
}

export class ReqDeleteAlternativeValue {
  selected: string[];
}

export class AlternativeValueResponse {
  alternativeCode: string;
  alternativeName: string;
  kriteriaCode: string;
  kriteriaName: string;
  value: number;
}
