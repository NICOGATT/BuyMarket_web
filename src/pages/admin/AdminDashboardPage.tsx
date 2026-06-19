function AdminDashboardPage() {
    const stats = [
        {
        title: "Productos",
        value: 0,
        description: "Publicaciones activas",
        },
        {
        title: "Usuarios",
        value: 0,
        description: "Cuentas registradas",
        },
        {
        title: "Pedidos",
        value: 0,
        description: "Pedidos generados",
        },
        {
        title: "Sugerencias",
        value: 0,
        description: "Categorías pendientes",
        },
    ];

    return (
        <section>
        <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-950">
            Panel de administración
            </h1>

            <p className="mt-2 text-slate-500">Control general de BuyMarket.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
            <article
                key={stat.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                {stat.title}
                </p>

                <h2 className="mt-4 text-4xl font-black text-slate-950">
                {stat.value}
                </h2>

                <p className="mt-2 text-slate-500">{stat.description}</p>
            </article>
            ))}
        </div>
        </section>
    );
}

export default AdminDashboardPage;
