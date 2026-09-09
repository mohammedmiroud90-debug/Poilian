import { NextResponse } from "next/server";
import { getSitePages } from "@/lib/pages";
export async function GET() { const pages = await getSitePages(); return NextResponse.json(pages.filter((page) => page.showInNavigation).map(({ slug, navigationLabel }) => ({ slug, navigationLabel }))); }
