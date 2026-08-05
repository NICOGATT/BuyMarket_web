import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import {
  createColor,
  deleteColor,
  getColors,
  updateColor,
} from "../../shared/services/color.service";
import type { Color, ColorPayload } from "../../shared/types/Color";

const HEX_PATTERN = /^#[0-9A-F]{6}$/;
const emptyForm: ColorPayload = { name: "", hex: "#000000" };

function sortColors(colors: Color[]) {
  return [...colors].sort((first, second) =>
    first.name.localeCompare(second.name, "es-AR")
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" ? message : fallback;
}

function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [form, setForm] = useState<ColorPayload>(emptyForm);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [deletingColorId, setDeletingColorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadColors() {
      try {
        const data = await getColors();
        setColors(sortColors(data));
      } catch (loadError) {
        setError(
          getErrorMessage(loadError, "No se pudo cargar el catálogo de colores.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadColors();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingColorId(null);
  }

  function handleEdit(color: Color) {
    setForm({ name: color.name, hex: color.hex.toUpperCase() });
    setEditingColorId(color.id);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      hex: form.hex.trim().toUpperCase(),
    };

    if (!payload.name) {
      setError("El nombre del color es obligatorio.");
      return;
    }

    if (payload.name.length > 80) {
      setError("El nombre del color puede tener hasta 80 caracteres.");
      return;
    }

    if (!HEX_PATTERN.test(payload.hex)) {
      setError("El HEX debe tener el formato #RRGGBB.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingColorId) {
        const updatedColor = await updateColor(editingColorId, payload);
        setColors((currentColors) =>
          sortColors(
            currentColors.map((color) =>
              color.id === editingColorId ? updatedColor : color
            )
          )
        );
        setSuccess("Color actualizado correctamente.");
      } else {
        const createdColor = await createColor(payload);
        setColors((currentColors) =>
          sortColors(currentColors.concat(createdColor))
        );
        setSuccess("Color creado correctamente.");
      }

      resetForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "No se pudo guardar el color."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(color: Color) {
    const shouldDelete = window.confirm(
      `¿Eliminar el color "${color.name}"? Los productos existentes conservarán el nombre y HEX guardados, pero el color dejará de estar disponible para nuevas publicaciones.`
    );

    if (!shouldDelete) return;

    setError("");
    setSuccess("");
    setDeletingColorId(color.id);

    try {
      await deleteColor(color.id);
      setColors((currentColors) =>
        currentColors.filter((currentColor) => currentColor.id !== color.id)
      );
      if (editingColorId === color.id) resetForm();
      setSuccess("Color eliminado correctamente.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "No se pudo eliminar el color."));
    } finally {
      setDeletingColorId(null);
    }
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Colores
        </h1>
        <p className="mt-2 text-slate-500">
          Administrá los nombres y muestras disponibles al publicar productos.
        </p>
      </div>

      {(error || success) && (
        <div className="mb-6 space-y-3">
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">
              {success}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8"
        >
          <h2 className="m-0 text-xl font-black text-slate-950">
            {editingColorId ? "Editar color" : "Agregar color"}
          </h2>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">Nombre</span>
            <input
              value={form.name}
              maxLength={80}
              disabled={isSaving}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  name: event.target.value,
                }))
              }
              placeholder="Ej: Azul petróleo"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <div>
            <span className="mb-2 block font-bold text-slate-700">Color</span>
            <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
              <label className="flex h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-4">
                <input
                  type="color"
                  value={HEX_PATTERN.test(form.hex) ? form.hex : "#000000"}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      hex: event.target.value.toUpperCase(),
                    }))
                  }
                  aria-label="Elegir color"
                  className="h-9 w-16 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                />
              </label>

              <label className="block">
                <span className="sr-only">Código HEX</span>
                <input
                  value={form.hex}
                  maxLength={7}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      hex: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="#RRGGBB"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono uppercase outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Guardando..."
                : editingColorId
                  ? "Guardar cambios"
                  : "Agregar color"}
            </button>

            {editingColorId && (
              <button
                type="button"
                disabled={isSaving}
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-black text-slate-950">Catálogo</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
              {colors.length} colores
            </span>
          </div>

          {isLoading ? (
            <p className="text-slate-500">Cargando colores...</p>
          ) : colors.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
              Todavía no hay colores en el catálogo.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {colors.map((color) => (
                <article
                  key={color.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <span
                    className="h-12 w-12 shrink-0 rounded-xl border border-slate-300 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="m-0 truncate font-black text-slate-900">
                      {color.name}
                    </h3>
                    <p className="mt-1 font-mono text-sm font-bold text-slate-500">
                      {color.hex}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(color)}
                      disabled={isSaving || deletingColorId === color.id}
                      aria-label={`Editar color ${color.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(color)}
                      disabled={isSaving || deletingColorId === color.id}
                      aria-label={`Eliminar color ${color.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminColorsPage;
