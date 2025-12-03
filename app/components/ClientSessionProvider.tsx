'use client';

import { SessionProvider } from "next-auth/react";

export default function ClientSessionProvider({ children }: any) {
    return <SessionProvider>{children}</SessionProvider>;   
}

