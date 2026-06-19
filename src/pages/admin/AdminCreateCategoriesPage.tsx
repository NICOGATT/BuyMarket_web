import { useState } from "react";
import {
  createCategory,
  uploadCategoryImages,
} from "../../shared/services/category.service";
import type { CreateCategoryPayload } from "../../shared/types/Category";

function AdminCreateCategoryPage() {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<CreateCategoryPayload>({
    name: "",
    description: "",
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const category = await createCategory({
        name: form.name,
        description: form.description,
      });

      if (iconFile || bannerFile) {
        await uploadCategoryImages(category.id, iconFile, bannerFile);
      }

      alert("Categoria creada correctamente");
      setForm({ name: "", description: "" });
      setIconFile(null);
      setBannerFile(null);
    } catch (error) {
      console.log(error);
      alert("No se pudo crear la categoria.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="w-full max-w-2xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Agregar categoria
        </h1>

        <p className="mt-2 text-slate-500">
          Crea una categoria disponible para las publicaciones.
        </p>
      </div>

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8"
        onSubmit={handleSubmit}
      >
        <input
          name="name"
          placeholder="Nombre de la categoria"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
        />

        <textarea
          name="description"
          placeholder="Descripcion"
          value={form.description}
          onChange={handleChange}
          className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
        />

        <label className="block">
          <span className="mb-2 block font-bold text-slate-700">Icono</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setIconFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-bold file:text-slate-700 hover:file:bg-slate-200"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-bold text-slate-700">Banner</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-bold file:text-slate-700 hover:file:bg-slate-200"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSaving ? "Guardando..." : "Guardar categoria"}
        </button>
      </form>
    </section>
  );
}

export default AdminCreateCategoryPage;
