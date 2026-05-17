import { NextResponse } from 'next/server';

/** Stay extensions (1-month / partial semester) are no longer supported under UniKL policy. */
export async function POST() {
    return NextResponse.json(
        {
            error: 'Stay extensions are not available',
            message:
                'All students are required to stay for the full semester (RM600). Partial-month extensions are no longer supported.',
        },
        { status: 410 }
    );
}
