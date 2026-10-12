import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";

type TermsAndConditionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e5f3ff] text-[#0754d8]">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-xs font-black uppercase tracking-wide text-[#0754b8]">
                BuyMarket
              </p>
              <h2
                id="terms-modal-title"
                className="m-0 text-xl font-black text-slate-950 sm:text-2xl"
              >
                Términos y condiciones
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar términos y condiciones"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 text-sm leading-6 text-slate-600 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Última actualización: a completar
          </p>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              1. Aceptación de los términos
            </h3>
            <p>
              Al crear una cuenta, publicar un producto o realizar una compra en BuyMarket
              aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con
              alguna parte, no debés utilizar la plataforma.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              2. Descripción del servicio
            </h3>
            <p>
              BuyMarket es un marketplace que conecta compradores y vendedores para la
              publicación, compra y venta de productos. BuyMarket actúa como intermediario
              tecnológico y no es propietario, no fabrica ni controla directamente los
              productos publicados por los vendedores.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              3. Registro y cuenta de usuario
            </h3>
            <p>
              Para operar en BuyMarket debés registrarte con datos verdaderos, completos y
              actualizados, y ser mayor de edad según la legislación vigente. Sos responsable
              de mantener la confidencialidad de tu contraseña y de toda actividad realizada
              desde tu cuenta.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              4. Publicación de productos
            </h3>
            <p>
              Quienes publiquen productos son responsables de que la información, precio,
              stock e imágenes sean veraces, y de que los productos cumplan con la normativa
              vigente. Está prohibido publicar artículos ilegales, falsificados, robados o que
              infrinjan derechos de terceros.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              5. Compras, pagos y billetera BuyMarket
            </h3>
            <p>
              Los pagos se procesan a través de los medios habilitados en la plataforma
              (tarjetas, transferencia u otros procesadores de pago) o mediante el saldo
              disponible en tu billetera BuyMarket. Sos responsable de verificar los datos de
              tu compra antes de confirmarla.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              6. Envíos y entregas
            </h3>
            <p>
              Los plazos y costos de envío informados en cada publicación son estimativos y
              pueden variar según el vendedor y la zona de entrega. BuyMarket puede ofrecer
              integraciones con servicios de envío, pero la responsabilidad del despacho
              corresponde al vendedor salvo que se indique lo contrario.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              7. Cancelaciones, devoluciones y reclamos
            </h3>
            <p>
              Las condiciones de cancelación y devolución pueden variar según el producto y el
              vendedor, dentro de lo permitido por la normativa de protección al consumidor
              aplicable. Ante un problema con una compra, podés iniciar un reclamo desde tu
              cuenta para que el equipo de BuyMarket intervenga.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              8. Conducta del usuario y contenido prohibido
            </h3>
            <p>
              No está permitido usar la plataforma para fraude, spam, suplantación de
              identidad, ni para publicar contenido difamatorio, discriminatorio o ilegal.
              BuyMarket puede remover contenido que incumpla estas reglas sin previo aviso.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              9. Propiedad intelectual
            </h3>
            <p>
              Las marcas, el logo y el diseño de BuyMarket son propiedad de BuyMarket. Al
              publicar contenido (imágenes, descripciones), le otorgás a BuyMarket una licencia
              para mostrarlo dentro de la plataforma con fines de operación y promoción del
              marketplace.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              10. Limitación de responsabilidad
            </h3>
            <p>
              BuyMarket no garantiza la disponibilidad ininterrumpida del servicio ni se hace
              responsable por daños derivados de transacciones entre compradores y vendedores,
              en la medida permitida por la ley aplicable.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              11. Suspensión y terminación de cuenta
            </h3>
            <p>
              BuyMarket puede suspender o cancelar cuentas que incumplan estos Términos y
              Condiciones, sin perjuicio de otras acciones legales que puedan corresponder.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              12. Modificaciones a estos términos
            </h3>
            <p>
              BuyMarket puede actualizar estos Términos y Condiciones en cualquier momento. Los
              cambios relevantes se comunicarán a través de la plataforma o por email, y el uso
              continuado del servicio implica su aceptación.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">
              13. Ley aplicable y jurisdicción
            </h3>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la República Argentina.
              Cualquier controversia se someterá a los tribunales competentes, sin perjuicio de
              los derechos que la normativa de defensa del consumidor reconozca al usuario.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-black text-slate-900">14. Contacto</h3>
            <p>
              Ante cualquier consulta sobre estos Términos y Condiciones podés escribirnos a{" "}
              <span className="font-bold text-slate-800">soporte@buymarket.com.ar</span>.
            </p>
          </section>
        </div>

        <div className="border-t border-slate-100 p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#087af2,#064bc8)] px-6 text-base font-black text-white shadow-[0_14px_30px_rgba(8,86,190,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(8,86,190,0.34)] focus:outline-none focus:ring-2 focus:ring-[#087af2] focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TermsAndConditionsModal;
