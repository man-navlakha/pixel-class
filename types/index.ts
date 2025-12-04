export interface Subject {
    id: number;
    name: string;
    sem: number;
}

export interface User {
    username: string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
    is_following?: boolean;
}

export interface PdfResource {
    id: number;
    name: string;
    pdf: string;
    choose: string;
    year?: number;
    username?: string;
}
