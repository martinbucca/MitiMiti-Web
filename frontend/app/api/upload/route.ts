import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

export async function POST(req: any) {
    try {
        const formData = await req.formData();
        const dir = formData.get('dir') as string;
        const file = formData.get('photo') as File;
        if (!file) {
            throw new Error("File not found in the form data");
        }

        const fileName = formData.get('fileName') as string;
        const fileExtension = file.type.split('/')[1];

        const targetDir = path.join(process.cwd(), `public/imgs/${dir}`);
        await fs.promises.mkdir(targetDir, { recursive: true });

        const filePath = path.join(targetDir, `${fileName}.${fileExtension}`);
        const fileStream = fs.createWriteStream(filePath);

        await pump(file.stream() as any, fileStream);

        return NextResponse.json({
            status: "success",
            data: file.size,
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "fail",
            data: e.message,
        }, { status: 500 });
    }
}