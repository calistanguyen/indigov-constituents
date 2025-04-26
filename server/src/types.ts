import { UploadedFile } from "express-fileupload";

export type Constituent = {
    email: string;
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    signUpDate: string;
}

export type GetConstituentParams = {
    email: string;
}

export type ExportConstituentsByDateParams = {
    startDate: string;
    endDate: string;
}

export type NewConstituentBody = {
    email: string;
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
}

export type UpdateConstituentBody = {
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
}

export type StatusResponse = {
    message: string;
}

export type FileUpload = {
    csv: UploadedFile;
}

