export interface User {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    photoURL?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    // add additional fields from Firestore User document as needed
    role?: string | null;
    company?: string | null;
    parent?: string | null;
    status?: string | null;
    avatarChanged?:boolean | null;
    vehicles?: number | null;
    loads?: number | null;
    directory?: number | null;
    adverts?: number | null;
    tms?: number | null;
    subscriptionId?: string | null;
  }