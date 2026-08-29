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

// CV Sections

type SectionEntry = {
    title: string;
    subtitle: string;
    startDate?: string;
    endDate?: string;
    bulletPoints?: string[]
}

type CvSections = {
    summary?: string;
    experience?: Record<string, SectionEntry[]>;
    education?: Record<string, SectionEntry[]>;
    languages?: string[];
    skills?: string[];
    otherSections?: Record<string, Record<string, SectionEntry[]>>;
}

type AllCvSections = Record<string, CvSections>;