import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { getAdminQuestions, updateQuestion } from "@/lib/questions";

export async function GET() {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  return NextResponse.json(await getAdminQuestions());
}

export async function PUT(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    answer?: unknown;
    status?: unknown;
  };
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "Missing question id." }, { status: 400 });

  const payload: Record<string, unknown> = {};
  if (typeof body.answer === "string") {
    const answer = body.answer.trim().slice(0, 8000);
    if (!answer) return NextResponse.json({ error: "Write an answer before publishing." }, { status: 400 });
    payload.answer = answer;
    payload.status = "answered";
    payload.answeredAt = new Date().toISOString();
  }
  if (body.status === "hidden" || body.status === "pending" || body.status === "answered") {
    payload.status = body.status;
  }
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  const ok = await updateQuestion(id, payload);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Question could not be updated." }, { status: 500 });
}
