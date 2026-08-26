const fs = require('fs');
const path = require('path');

const folders = [
  'src/app/(auth)/login',
  'src/app/(auth)/reset-password',
  'src/app/(dashboard)/admin/users',
  'src/app/(dashboard)/admin/subjects',
  'src/app/(dashboard)/admin/mentorship',
  'src/app/(dashboard)/teacher/attendance',
  'src/app/(dashboard)/teacher/marks',
  'src/app/(dashboard)/teacher/feedback',
  'src/app/(dashboard)/mentor/mentees',
  'src/app/(dashboard)/mentor/meetings',
  'src/app/(dashboard)/mentor/remarks',
  'src/app/(dashboard)/student/marks',
  'src/app/(dashboard)/student/meetings',
  'src/app/(dashboard)/parent/feedback',
  'src/app/api/notifications',
  'src/app/api/uploads',
  'src/features/auth/components',
  'src/features/auth/hooks',
  'src/features/admin/components',
  'src/features/admin/hooks',
  'src/features/teacher/components',
  'src/features/teacher/hooks',
  'src/features/mentor/components',
  'src/features/mentor/hooks',
  'src/features/student/components',
  'src/features/student/hooks',
  'src/features/parent/components',
  'src/features/parent/hooks',
  'src/features/notifications/components',
  'src/features/notifications/hooks',
  'src/shared/components',
  'src/shared/hooks',
  'src/shared/utils',
  'src/lib/prisma',
  'src/lib/email/templates',
  'src/lib/storage',
  'src/lib/validation',
  'prisma/migrations',
  'storage',
  'public'
];

const files = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/reset-password/page.tsx',
  'src/app/(dashboard)/admin/layout.tsx',
  'src/app/(dashboard)/admin/page.tsx',
  'src/app/(dashboard)/admin/users/page.tsx',
  'src/app/(dashboard)/admin/subjects/page.tsx',
  'src/app/(dashboard)/admin/mentorship/page.tsx',
  'src/app/(dashboard)/teacher/layout.tsx',
  'src/app/(dashboard)/teacher/page.tsx',
  'src/app/(dashboard)/teacher/attendance/page.tsx',
  'src/app/(dashboard)/teacher/marks/page.tsx',
  'src/app/(dashboard)/teacher/feedback/page.tsx',
  'src/app/(dashboard)/mentor/layout.tsx',
  'src/app/(dashboard)/mentor/page.tsx',
  'src/app/(dashboard)/mentor/mentees/page.tsx',
  'src/app/(dashboard)/mentor/meetings/page.tsx',
  'src/app/(dashboard)/mentor/remarks/page.tsx',
  'src/app/(dashboard)/student/layout.tsx',
  'src/app/(dashboard)/student/page.tsx',
  'src/app/(dashboard)/student/marks/page.tsx',
  'src/app/(dashboard)/student/meetings/page.tsx',
  'src/app/(dashboard)/parent/layout.tsx',
  'src/app/(dashboard)/parent/page.tsx',
  'src/app/(dashboard)/parent/feedback/page.tsx',
  'src/app/api/notifications/route.ts',
  'src/app/api/uploads/route.ts',
  'src/features/auth/actions.ts',
  'src/features/auth/queries.ts',
  'src/features/auth/schema.ts',
  'src/features/auth/types.ts',
  'src/features/admin/actions.ts',
  'src/features/admin/queries.ts',
  'src/features/admin/types.ts',
  'src/features/teacher/actions.ts',
  'src/features/teacher/queries.ts',
  'src/features/teacher/types.ts',
  'src/features/mentor/actions.ts',
  'src/features/mentor/queries.ts',
  'src/features/mentor/types.ts',
  'src/features/student/actions.ts',
  'src/features/student/queries.ts',
  'src/features/student/types.ts',
  'src/features/parent/actions.ts',
  'src/features/parent/queries.ts',
  'src/features/parent/types.ts',
  'src/features/notifications/actions.ts',
  'src/features/notifications/types.ts',
  'src/lib/prisma/client.ts',
  'src/lib/email/transporter.ts',
  'src/lib/email/send.ts',
  'src/lib/storage/uploadFile.ts',
  'src/lib/storage/getFile.ts',
  'src/lib/storage/deleteFile.ts',
  'src/middleware.ts',
  'prisma/seed.ts',
  '.env.local',
  '.env.production'
];

folders.forEach(folder => {
  fs.mkdirSync(path.join(__dirname, folder), { recursive: true });
});

files.forEach(file => {
  fs.writeFileSync(path.join(__dirname, file), '');
});

fs.writeFileSync(path.join(__dirname, 'src/app/layout.tsx'), `
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`);

fs.writeFileSync(path.join(__dirname, 'src/app/page.tsx'), `
export default function Page() {
  return <h1>Mentra Platform</h1>
}
`);

fs.writeFileSync(path.join(__dirname, 'src/app/globals.css'), `
@import "tailwindcss";
`);

fs.writeFileSync(path.join(__dirname, 'next.config.ts'), `
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`);

fs.writeFileSync(path.join(__dirname, 'tailwind.config.ts'), `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
`);

const tsconfig = {
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
};

fs.writeFileSync(path.join(__dirname, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

const packageJson = {
  "name": "mentra",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "next": "latest",
    "next-auth": "beta",
    "next-themes": "latest",
    "nodemailer": "latest",
    "prisma": "^5.0.0",
    "react": "latest",
    "react-dom": "latest",
    "sonner": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/nodemailer": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest"
  }
};

fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));

const prismaSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

fs.writeFileSync(path.join(__dirname, 'prisma/schema.prisma'), prismaSchema);

console.log('Scaffolding complete!');
