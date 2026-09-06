import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const informeSchema = z.object({
  data: z.string(),
  turno: z.string(),
  dados: z.record(z.string(), z.unknown()),
});

const payloadSchema = z.object({
  informe: informeSchema,
  tipo: z.enum(["rascunho", "salvo"]),
});

export type InformePersistido = z.infer<typeof informeSchema>;

export const obterInformeEquipamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("equipamentos_informes")
      .select("informe, rascunho, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return {
      informe: (data?.informe ?? null) as InformePersistido | null,
      rascunho: (data?.rascunho ?? null) as InformePersistido | null,
    };
  });

export const salvarInformeEquipamentos = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => payloadSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const patch =
      data.tipo === "salvo"
        ? { informe: data.informe, rascunho: data.informe }
        : { rascunho: data.informe };
    const { error } = await context.supabase
      .from("equipamentos_informes")
      .upsert({ user_id: context.userId, ...patch }, { onConflict: "user_id" });
    if (error) throw error;
    return { ok: true };
  });
