import { redirect } from "next/navigation";

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && key !== "vista" && key !== "pais")
      query.set(key, value);
  }
  redirect(query.size ? `/?${query.toString()}` : "/");
}
