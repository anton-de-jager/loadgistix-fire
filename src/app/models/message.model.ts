
export class message {
    id?: string;
    userIdFrom?: string;
    userIdTo?: string;
    title?: string;
    description?: string;
    link?: string;
    timestamp?: Date;
    read?: boolean | null;
    status?: string;
}