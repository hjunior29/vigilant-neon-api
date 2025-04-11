export type Topic = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    publisherId?: string;
    subscriberId?: string;
    content?: Json;
}

export type Publisher = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    name?: string;
}

export type Subscriber = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    name?: string;
}

export type Json = Record<string, unknown>;