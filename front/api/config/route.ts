export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({textReady:!!process.env.OPENAI_API_KEY,imageReady:!!process.env.OPENOX_API_KEY,
    textModel:process.env.OPENAI_MODEL || 'gpt-4.1-mini', imageModel:process.env.OPENOX_IMAGE_MODEL || 'gpt-image-2'});
}
