"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";
import { clientRequest } from "@/lib/client-request";
import { memberRoleLabels } from "@/lib/application-status";
import { cx } from "@/lib/cx";
import { buttonClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  FormSuccess,
  selectClass,
} from "@/components/ui/field";

type Member = {
  userId: string;
  displayName: string;
  email: string;
  memberRole: string;
};

const roles = ["owner", "recruiter", "viewer"] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : name.slice(0, 2)
  ).toUpperCase();
}

async function readError(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  return payload.error ?? "No pudimos guardar el cambio.";
}

/** Owners add people who already have an account, change roles or remove them. */
export function TeamManager({
  organizationSlug,
  members,
  currentUserId,
}: {
  organizationSlug: string;
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState("");

  async function save(email: string, memberRole: string, key: string) {
    setBusy(key);
    setError("");
    setNotice("");
    const response = await clientRequest("/api/organization/members", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug, email, memberRole }),
    });
    setBusy("");
    if (!response.ok) {
      setError(await readError(response));
      return false;
    }
    setNotice(
      response.status === 201
        ? "Persona sumada al equipo."
        : "Rol actualizado.",
    );
    router.refresh();
    return true;
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (
      await save(
        String(form.get("email")),
        String(form.get("memberRole")),
        "add",
      )
    )
      formElement.reset();
  }

  async function remove(member: Member) {
    setBusy(member.userId);
    setError("");
    setNotice("");
    const response = await clientRequest("/api/organization/members", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug, userId: member.userId }),
    });
    setBusy("");
    setConfirming("");
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setNotice(`${member.displayName} ya no está en el equipo.`);
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-4 rounded-panel border border-line bg-paper p-5 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end sm:p-6"
        onSubmit={add}
      >
        <Field label="Correo de su cuenta en LinkUp">
          <input
            className={controlClass}
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="persona@startup.com"
          />
        </Field>
        <Field label="Rol">
          <select
            className={selectClass}
            name="memberRole"
            defaultValue="recruiter"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {memberRoleLabels[role]}
              </option>
            ))}
          </select>
        </Field>
        <button className={buttonClass()} disabled={busy === "add"}>
          {busy === "add" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus className="size-4" aria-hidden="true" />
          )}
          Sumar al equipo
        </button>
        <p className="text-[13px] leading-5 text-muted sm:col-span-3">
          La persona debe crear su cuenta en LinkUp antes. Responsable gestiona
          el equipo y los candidatos; Selección de personas ve y actualiza
          candidatos; Solo lectura ve el resumen.
        </p>
      </form>

      <FormError>{error}</FormError>
      {notice && <FormSuccess>{notice}</FormSuccess>}

      {members.length === 0 && (
        <p className="rounded-panel border border-dashed border-line-strong px-5 py-8 text-center text-[15px] text-body">
          Todavía no hay nadie en el equipo de esta startup.
        </p>
      )}
      <ul className="divide-y divide-line rounded-panel border border-line bg-paper empty:hidden">
        {members.map((member) => (
          <li
            className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5"
            key={member.userId}
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface font-meta text-xs font-semibold text-action"
              aria-hidden="true"
            >
              {initials(member.displayName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">
                {member.displayName}
                {member.userId === currentUserId && (
                  <span className="ml-1.5 font-normal text-muted">(tú)</span>
                )}
              </span>
              <span className="block truncate text-[13px] text-muted">
                {member.email}
              </span>
            </span>
            {confirming === member.userId ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink">¿Quitar del equipo?</span>
                <button
                  className={buttonClass({ variant: "danger", size: "sm" })}
                  type="button"
                  disabled={busy === member.userId}
                  onClick={() => remove(member)}
                >
                  Sí, quitar
                </button>
                <button
                  className={buttonClass({ variant: "quiet", size: "sm" })}
                  type="button"
                  onClick={() => setConfirming("")}
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <select
                  className={cx(selectClass, "min-h-10 w-auto text-sm")}
                  value={member.memberRole}
                  disabled={busy === member.userId}
                  aria-label={`Rol de ${member.displayName}`}
                  onChange={(event) =>
                    save(member.email, event.target.value, member.userId)
                  }
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {memberRoleLabels[role]}
                    </option>
                  ))}
                </select>
                <button
                  className={buttonClass({ variant: "quiet", size: "sm" })}
                  type="button"
                  onClick={() => setConfirming(member.userId)}
                >
                  Quitar
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
