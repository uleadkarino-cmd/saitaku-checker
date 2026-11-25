import { env } from 'cloudflare:workers';
import { handleReview } from '@/lib/ai-review';

export function GET(request: Request) { return handleReview(request, env); }
export function POST(request: Request) { return handleReview(request, env); }
