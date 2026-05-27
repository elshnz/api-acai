import { User } from '../users/entities/user.entity';

declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            name?: string;
            [key: string]: any;
        }
    }
}

export { };