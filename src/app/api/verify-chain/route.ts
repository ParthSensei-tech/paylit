import { NextResponse } from "next/server";
import { verifyAuditChain } from "@/lib/vault/hash-chain";

export async function GET() {
  try {
    const result = await verifyAuditChain();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
