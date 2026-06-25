import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  try {
    const { products } = await searchProducts(q, { limit: 8 });
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
