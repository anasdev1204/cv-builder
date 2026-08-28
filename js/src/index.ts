type UserData = {
    name: string;
    email: string;
    phoneNumber?: string;
    linkedin?: string;
    portfolio?: string;
    address?: {
        country: string;
        city: string;
    }
    otherDetails?: Record<string, any>;
}

type CvSections = {
    summary?: string;
    experience?: string;
    education?: string;
    languages?: string[];
    skills?: string[];
    otherSections?: Record<string, any>;
}