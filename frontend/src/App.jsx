import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Inventory", icon: Boxes },
  { label: "Sales", icon: ShoppingCart },
  { label: "Expenses", icon: CircleDollarSign },
  { label: "Reports", icon: BarChart3 },
];

function formatMoney(cents) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Icon size={20} />
        </span>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
    </article>
  );
}

function ProductForm({ onClose, onSave, saving, error, initialProduct }) {
  const [form, setForm] = useState(() => ({
    name: initialProduct?.name ?? "",
    sku: initialProduct?.sku ?? "",
    category: initialProduct?.category ?? "",
    cost_price: initialProduct ? String(initialProduct.cost_price / 100) : "",
    selling_price: initialProduct
      ? String(initialProduct.selling_price / 100)
      : "",
    quantity: initialProduct ? String(initialProduct.quantity) : "",
    low_stock_threshold: initialProduct
      ? String(initialProduct.low_stock_threshold)
      : "5",
  }));

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const product = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      cost_price: Math.round(Number(form.cost_price) * 100),
      selling_price: Math.round(Number(form.selling_price) * 100),
      quantity: Number(form.quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
    };

    await onSave(product);
  }

  const fields = [
    {
      name: "name",
      label: "Product name",
      placeholder: "e.g. Wireless Mouse",
      type: "text",
    },
    {
      name: "sku",
      label: "SKU",
      placeholder: "e.g. NXR-001",
      type: "text",
    },
    {
      name: "category",
      label: "Category",
      placeholder: "e.g. Electronics",
      type: "text",
    },
    {
      name: "cost_price",
      label: "Cost price (KES)",
      placeholder: "0.00",
      type: "number",
    },
    {
      name: "selling_price",
      label: "Selling price (KES)",
      placeholder: "0.00",
      type: "number",
    },
    {
      name: "quantity",
      label: "Quantity in stock",
      placeholder: "0",
      type: "number",
    },
    {
      name: "low_stock_threshold",
      label: "Low-stock threshold",
      placeholder: "5",
      type: "number",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialProduct ? "Edit product" : "Add product"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {initialProduct
                ? "Update the details of this product."
                : "Add an item to your inventory."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label
                key={field.name}
                className="text-sm font-medium text-slate-700"
              >
                {field.label}

                <input
                  required
                  min={field.type === "number" ? "0" : undefined}
                  step={
                    ["cost_price", "selling_price"].includes(field.name)
                      ? "0.01"
                      : field.type === "number"
                        ? "1"
                        : undefined
                  }
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : initialProduct
                  ? "Update product"
                  : "Save product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Overview");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function loadProducts() {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Could not load inventory.");
      }

      const data = await response.json();

      setProducts(data);
      setApiError("");
    } catch {
      setApiError(
        "Unable to connect to Nexora. Check that the Flask API is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function saveProduct(product) {
    setSaving(true);
    setFormError("");

    const isEditing = editingProduct !== null;

    const url = isEditing
      ? `${API_URL}/products/${editingProduct.id}`
      : `${API_URL}/products`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save the product.");
      }

      if (isEditing) {
        setProducts((current) =>
          current.map((item) => (item.id === data.id ? data : item)),
        );
      } else {
        setProducts((current) => [data, ...current]);
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormError("");
      setApiError("");
    } catch (error) {
      setFormError(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" from your inventory?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete the product.");
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );

      setApiError("");
    } catch (error) {
      setApiError(error.message || "Could not delete the product.");
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) =>
    [product.name, product.sku, product.category].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(normalizedSearch),
    ),
  );

  const totalUnits = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  );

  const inventoryValue = products.reduce(
    (sum, product) => sum + product.cost_price * product.quantity,
    0,
  );

  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.low_stock_threshold,
  );

  function openAddForm() {
    setEditingProduct(null);
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
    setFormError("");
  }

  function renderNavigation(closeMobile = false) {
    return navigation.map(({ label, icon: Icon }) => (
      <button
        key={label}
        onClick={() => {
          setActivePage(label);

          if (closeMobile) {
            setMobileMenuOpen(false);
          }
        }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
          activePage === label
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Icon size={19} />
        {label}
      </button>
    ));
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
            <Activity size={23} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Nexora
            </h1>
            <p className="text-xs text-slate-500">Business management</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">{renderNavigation()}</nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-sm font-semibold">Run smarter.</p>

            <p className="mt-1 text-xs leading-5 text-slate-300">
              Keep your inventory organized and your business moving.
            </p>
          </div>

          <button
            onClick={() => setActivePage("Settings")}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50"
          >
            <Settings size={19} />
            Settings
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <aside className="h-full w-72 bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xl font-extrabold">Nexora</span>

              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X />
              </button>
            </div>

            <nav className="space-y-2">{renderNavigation(true)}</nav>
          </aside>
        </div>
      )}

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Workspace / {activePage}
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage("Notifications")}
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <Bell size={19} />

              {lowStockProducts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                NX
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Nexora</p>
                <p className="text-xs text-slate-500">Business workspace</p>
              </div>

              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 md:p-8">
          {apiError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertTriangle size={19} className="mt-0.5 shrink-0" />

              <div className="flex-1">{apiError}</div>

              <button
                onClick={loadProducts}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-500">
                Welcome to your workspace
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                Business overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor your stock and keep your operations organized.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add product
            </button>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Inventory items"
              value={products.length}
              subtitle="Unique products"
              icon={Package}
            />

            <StatCard
              title="Units in stock"
              value={totalUnits.toLocaleString()}
              subtitle="Across all products"
              icon={Boxes}
            />

            <StatCard
              title="Inventory value"
              value={formatMoney(inventoryValue)}
              subtitle="Based on cost prices"
              icon={CircleDollarSign}
            />

            <StatCard
              title="Low-stock products"
              value={lowStockProducts.length}
              subtitle="At or below threshold"
              icon={AlertTriangle}
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Inventory
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Products currently stored in your database.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-3 pr-4 font-semibold">Product</th>
                      <th className="pb-3 pr-4 font-semibold">SKU</th>
                      <th className="pb-3 pr-4 font-semibold">Price</th>
                      <th className="pb-3 pr-4 font-semibold">Stock</th>
                      <th className="pb-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-12 text-center text-slate-500"
                        >
                          Loading inventory...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center">
                          <div className="mx-auto flex max-w-xs flex-col items-center">
                            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                              <Package size={26} />
                            </div>

                            <p className="mt-4 font-semibold text-slate-700">
                              {search
                                ? "No matching products"
                                : "Your inventory is empty"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {search
                                ? "Try a different search term."
                                : "Add your first product to get started."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const isLowStock =
                          product.quantity <= product.low_stock_threshold;

                        return (
                          <tr
                            key={product.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="py-4 pr-4">
                              <p className="font-semibold text-slate-800">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {product.category}
                              </p>
                            </td>

                            <td className="py-4 pr-4 text-slate-500">
                              {product.sku}
                            </td>

                            <td className="py-4 pr-4 font-medium text-slate-700">
                              {formatMoney(product.selling_price)}
                            </td>

                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isLowStock
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {product.quantity} units
                              </span>
                            </td>

                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setFormError("");
                                    setShowForm(true);
                                  }}
                                  aria-label={`Edit ${product.name}`}
                                  title="Edit product"
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  <Pencil size={17} />
                                </button>

                                <button
                                  onClick={() => deleteProduct(product)}
                                  aria-label={`Delete ${product.name}`}
                                  title="Delete product"
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Stock alerts</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Products that need attention
                    </p>
                  </div>

                  <AlertTriangle size={20} className="text-amber-500" />
                </div>

                <div className="mt-5 space-y-3">
                  {lowStockProducts.length === 0 ? (
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">
                        All stock levels look good
                      </p>

                      <p className="mt-1 text-xs text-emerald-700">
                        No products are currently below their stock thresholds.
                      </p>
                    </div>
                  ) : (
                    lowStockProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            SKU: {product.sku}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-amber-700">
                          {product.quantity} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                <div className="flex items-center gap-2 text-indigo-100">
                  <Activity size={19} />

                  <span className="text-sm font-medium">
                    Inventory snapshot
                  </span>
                </div>

                <p className="mt-5 text-3xl font-extrabold">
                  {totalUnits.toLocaleString()}
                </p>

                <p className="mt-1 text-sm text-indigo-100">
                  Total units available
                </p>

                <div className="mt-6 h-px bg-white/20" />

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-indigo-100">Tracked products</span>
                  <span className="font-bold">{products.length}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-indigo-100">Needs attention</span>
                  <span className="font-bold">{lowStockProducts.length}</span>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>

      {showForm && (
        <ProductForm
          onClose={closeForm}
          onSave={saveProduct}
          saving={saving}
          error={formError}
          initialProduct={editingProduct}
        />
      )}
    </div>
  );
}

export default App;
