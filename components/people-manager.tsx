"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { clientRequest } from "@/lib/client-request";
import { userRoleLabels } from "@/lib/application-status";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  FormSuccess,
  selectClass,
} from "@/components/ui/field";

type Operator = {
  userId: string;
  displayName: string;
  email: string;
  role: string;
};

/** Administrators name curators or administrators by account email. */
export function PeopleManager({
  operators,
  currentUserId,
}: {
  operators: Operator[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function setRole(email: string, role: string, key: string) {
    setBusy(key);
    setError("");
    setNotice("");
    const response = await clientRequest("/api/admin/roles", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setBusy("");
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(payload.error ?? "No pudimos cambiar el rol.");
      return false;
    }
    setNotice(
      role === "talent"
        ? `${email} ya no tiene acceso de operación.`
        : `${email} ahora tiene rol de ${userRoleLabels[role]}.`,
    );
    router.refresh();
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (
      await setRole(String(form.get("email")), String(form.get("role")), "form")
    )
      formElement.reset();
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-4 rounded-panel border border-line bg-paper p-5 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end sm:p-6"
        onSubmit={submit}
      >
        <Field label="Correo de su cuenta en LinkUp">
          <input
            className={controlClass}
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="persona@correo.com"
          />
        </Field>
        <Field label="Rol">
          <select className={selectClass} name="role" defaultValue="curator">
            <option value="curator">{userRoleLabels.curator}</option>
            <option value="admin">{userRoleLabels.admin}</option>
          </select>
        </Field>
        <button className={buttonClass()} disabled={busy === "form"}>
          {busy === "form" && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          Asignar rol
        </button>
        <p className="text-[13px] leading-5 text-muted sm:col-span-3">
          Curaduría revisa envíos y edita el catálogo. Administración además
          aprueba reclamos de startups y gestiona roles. Nadie puede cambiar su
          propio rol.
        </p>
      </form>

      <FormError>{error}</FormError>
      {notice && <FormSuccess>{notice}</FormSuccess>}

      <ul className="divide-y divide-line rounded-panel border border-line bg-paper">
        {operators.map((operator) => (
          <li
            className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:px-5"
            key={operator.userId}
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">
                {operator.displayName}
                {operator.userId === currentUserId && (
                  <span className="ml-1.5 font-normal text-muted">(tú)</span>
                )}
              </span>
              <span className="block truncate text-[13px] text-muted">
                {operator.email}
              </span>
            </span>
            <Badge tone={operator.role === "admin" ? "info" : "neutral"}>
              {userRoleLabels[operator.role] ?? operator.role}
            </Badge>
            {operator.userId !== currentUserId && (
              <button
                className={buttonClass({ variant: "quiet", size: "sm" })}
                type="button"
                disabled={busy === operator.userId}
                onClick={() =>
                  setRole(operator.email, "talent", operator.userId)
                }
              >
                Quitar rol
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
