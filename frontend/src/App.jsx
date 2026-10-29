import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Inventory", icon: Package },
  { label: "Sales", icon: ShoppingCart },
  { label: "Expenses", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
];

const secondaryNavigation = [{ label: "Settings", icon: Settings }];

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format((Number(amountInCents) || 0) / 100);
}

function getStockStatus(product) {
  const quantity = Number(product.quantity) || 0;
  const threshold = Number(product.low_stock_threshold) || 0;

  if (quantity === 0) {
    return "Out of stock";
  }

  if (quantity <= threshold) {
    return "Low stock";
  }

  return "In stock";
}

function getStockStatusStyles(status) {
  switch (status) {
    case "In stock":
      return "bg-emerald-50 text-emerald-700";
    case "Low stock":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-rose-50 text-rose-700";
  }
}

function StatCard({ title, value, description, icon: Icon, iconClass, trend }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}

        <span className="text-slate-500">{description}</span>
      </div>
    </div>
  );
}

function ProductForm({ product, onClose, onSave, saving }) {
  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "",
    cost_price:
      product?.cost_price != null
        ? String(Number(product.cost_price) / 100)
        : "",
    selling_price:
      product?.selling_price != null
        ? String(Number(product.selling_price) / 100)
        : "",
    quantity: product?.quantity != null ? String(product.quantity) : "0",
    low_stock_threshold:
      product?.low_stock_threshold != null
        ? String(product.low_stock_threshold)
        : "5",
  });

  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError("Product name and SKU are required.");
      return;
    }

    const costPrice = Number(formData.cost_price);
    const sellingPrice = Number(formData.selling_price);
    const quantity = Number(formData.quantity);
    const lowStockThreshold = Number(formData.low_stock_threshold);

    if (
      formData.cost_price.trim() === "" ||
      formData.selling_price.trim() === "" ||
      !Number.isFinite(costPrice) ||
      !Number.isFinite(sellingPrice) ||
      costPrice < 0 ||
      sellingPrice < 0
    ) {
      setFormError("Enter valid, non-negative prices.");
      return;
    }

    if (
      formData.quantity.trim() === "" ||
      formData.low_stock_threshold.trim() === "" ||
      !Number.isInteger(quantity) ||
      !Number.isInteger(lowStockThreshold) ||
      quantity < 0 ||
      lowStockThreshold < 0
    ) {
      setFormError(
        "Quantity and low-stock threshold must be non-negative whole numbers.",
      );
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      cost_price: Math.round(costPrice * 100),
      selling_price: Math.round(sellingPrice * 100),
      quantity,
      low_stock_threshold: lowStockThreshold,
    };

    try {
      await onSave(payload);
    } catch (error) {
      setFormError(error.message || "Could not save the product.");
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="product-form-title"
              className="text-lg font-bold text-slate-900"
            >
              {product ? "Edit product" : "Add new product"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {product
                ? "Update the product information below."
                : "Enter the details of the product you want to track."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product form"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Product name *
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Mouse"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="text-sm font-medium text-slate-700"
              >
                SKU *
              </label>
              <input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. ACC-001"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Accessories"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="cost_price"
                className="text-sm font-medium text-slate-700"
              >
                Cost price (KES) *
              </label>
              <input
                id="cost_price"
                name="cost_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_price}
                onChange={handleChange}
                placeholder="0.00"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="selling_price"
                className="text-sm font-medium text-slate-700"
              >
                Selling price (KES) *
              </label>
              <input
                id="selling_price"
                name="selling_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={handleChange}
                placeholder="0.00"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-slate-700"
              >
                Quantity *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="low_stock_threshold"
                className="text-sm font-medium text-slate-700"
              >
                Low-stock threshold *
              </label>
              <input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                min="0"
                step="1"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : product ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ onAddProduct, hasFilters }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Package size={27} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {hasFilters ? "No matching products" : "Your inventory is empty"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "Try changing your search or filter selections."
          : "Add your first product to start tracking your inventory."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onAddProduct}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={17} />
          Add first product
        </button>
      )}
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => setSuccessMessage(""), 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error(
          "Could not load products. Check that the backend is running.",
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The products API returned an unexpected response.");
      }

      setProducts(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Make sure Flask is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(payload) {
    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Could not ${isEditing ? "update" : "create"} product.`,
        );
      }

      await loadProducts();

      setShowProductForm(false);
      setEditingProduct(null);
      setSuccessMessage(
        isEditing
          ? "Product updated successfully."
          : "Product added successfully.",
      );
    } catch (err) {
      setError(err.message || "Something went wrong while saving the product.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not delete this product.",
        );
      }

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id),
      );

      setSuccessMessage("Product deleted successfully.");
    } catch (err) {
      setError(
        err.message || "Something went wrong while deleting the product.",
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  function openAddProductForm() {
    setEditingProduct(null);
    setShowProductForm(true);
  }

  function openEditProductForm(product) {
    setEditingProduct(product);
    setShowProductForm(true);
  }

  function closeProductForm() {
    if (saving) {
      return;
    }

    setShowProductForm(false);
    setEditingProduct(null);
  }

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((product) => product.category)
            .filter((category) => Boolean(category && category.trim())),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = [
          product.name,
          product.sku,
          product.category,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

        const matchesCategory =
          categoryFilter === "all" || product.category === categoryFilter;

        const quantity = Number(product.quantity) || 0;
        const threshold = Number(product.low_stock_threshold) || 0;

        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "in-stock" && quantity > threshold) ||
          (stockFilter === "low-stock" &&
            quantity > 0 &&
            quantity <= threshold) ||
          (stockFilter === "out-of-stock" && quantity === 0);

        return matchesSearch && matchesCategory && matchesStock;
      }),
    [products, normalizedSearch, categoryFilter, stockFilter],
  );

  const totalUnits = products.reduce(
    (total, product) => total + (Number(product.quantity) || 0),
    0,
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total +
      (Number(product.cost_price) || 0) * (Number(product.quantity) || 0),
    0,
  );

  const lowStockProducts = products.filter((product) => {
    const quantity = Number(product.quantity) || 0;
    const threshold = Number(product.low_stock_threshold) || 0;

    return quantity <= threshold;
  });

  const outOfStockCount = products.filter(
    (product) => Number(product.quantity) === 0,
  ).length;

  const inStockCount = products.filter((product) => {
    const quantity = Number(product.quantity) || 0;
    const threshold = Number(product.low_stock_threshold) || 0;

    return quantity > threshold;
  }).length;

  function navigateTo(page) {
    setActivePage(page);
    setSidebarOpen(false);
    setError("");
  }

  const hasActiveFilters =
    Boolean(search.trim()) || stockFilter !== "all" || categoryFilter !== "all";

  function resetFilters() {
    setSearch("");
    setStockFilter("all");
    setCategoryFilter("all");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Activity size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Nexora
            </h1>
            <p className="text-xs text-slate-500">Business management</p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => {
              const isActive = activePage === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigateTo(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  <span>{label}</span>

                  {label === "Inventory" && lowStockProducts.length > 0 && (
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {lowStockProducts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Preferences
          </p>

          <nav className="space-y-1">
            {secondaryNavigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigateTo(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  activePage === label
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <TrendingUp size={19} />
            </div>

            <p className="mt-4 text-sm font-semibold">Grow your business</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Keep your inventory organised and your operations moving.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Inventory workspace
            </div>
          </div>

          <p className="px-3 pb-2 pt-4 text-xs text-slate-400">
            Nexora · Business tools
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Workspace / {activePage}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {activePage === "Overview" ? "Business overview" : activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo("Inventory")}
              aria-label="View inventory alerts"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
            >
              <Bell size={19} />
              {lowStockProducts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                NX
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">
                  Business workspace
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <AlertTriangle size={19} className="mt-0.5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-lg p-1 hover:bg-rose-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              <Check size={19} />
              <span>{successMessage}</span>
            </div>
          )}

          {activePage === "Overview" && (
            <OverviewPage
              products={products}
              loading={loading}
              totalUnits={totalUnits}
              inventoryValue={inventoryValue}
              lowStockProducts={lowStockProducts}
              inStockCount={inStockCount}
              outOfStockCount={outOfStockCount}
              onViewInventory={() => navigateTo("Inventory")}
              onAddProduct={openAddProductForm}
            />
          )}

          {activePage === "Inventory" && (
            <section>
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Inventory
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Manage your products, monitor stock, and update prices.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddProductForm}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Add product
                </button>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                      <Boxes size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total products</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {products.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Low stock</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {lowStockProducts.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Out of stock</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {outOfStockCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                    <div>
                      <h2 className="font-bold text-slate-900">All products</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {filteredProducts.length} of {products.length} products
                        shown
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <div className="relative w-full sm:w-56">
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

                      <select
                        value={stockFilter}
                        onChange={(event) => setStockFilter(event.target.value)}
                        aria-label="Filter by stock status"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value="all">All stock</option>
                        <option value="in-stock">In stock</option>
                        <option value="low-stock">Low stock</option>
                        <option value="out-of-stock">Out of stock</option>
                      </select>

                      <select
                        value={categoryFilter}
                        onChange={(event) =>
                          setCategoryFilter(event.target.value)
                        }
                        aria-label="Filter by category"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value="all">All categories</option>

                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="rounded-xl px-3 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Loading inventory...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <EmptyState
                    onAddProduct={openAddProductForm}
                    hasFilters={hasActiveFilters}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-100">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Product
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            SKU
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Category
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Cost price
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Selling price
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Quantity
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((product) => {
                          const status = getStockStatus(product);

                          return (
                            <tr
                              key={product.id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Package size={19} />
                                  </div>

                                  <span className="text-sm font-semibold text-slate-800">
                                    {product.name}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-500">
                                {product.sku}
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-600">
                                {product.category || "Uncategorised"}
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-600">
                                {formatCurrency(product.cost_price)}
                              </td>

                              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                {formatCurrency(product.selling_price)}
                              </td>

                              <td className="px-6 py-4">
                                <div>
                                  <span className="text-sm font-semibold text-slate-800">
                                    {product.quantity}
                                  </span>
                                  <p className="mt-1 text-xs text-slate-400">
                                    Threshold:{" "}
                                    {product.low_stock_threshold ?? 0}
                                  </p>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStockStatusStyles(status)}`}
                                >
                                  {status}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditProductForm(product)}
                                    aria-label={`Edit ${product.name}`}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                  >
                                    <Pencil size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(product)}
                                    disabled={deletingProductId === product.id}
                                    aria-label={`Delete ${product.name}`}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                  >
                                    {deletingProductId === product.id ? (
                                      <span className="block h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                                    ) : (
                                      <Trash2 size={17} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && filteredProducts.length > 0 && (
                  <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center">
                    <span>
                      Showing {filteredProducts.length} of {products.length}{" "}
                      products
                    </span>

                    <span>Inventory updates are saved to your database.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {!["Overview", "Inventory"].includes(activePage) && (
            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                {activePage === "Sales" && <ShoppingCart size={26} />}
                {activePage === "Expenses" && <Wallet size={26} />}
                {activePage === "Reports" && <BarChart3 size={26} />}
                {activePage === "Settings" && <Settings size={26} />}
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                {activePage} workspace
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                This section is not implemented yet. Your dashboard and
                inventory management are available now.
              </p>

              <button
                type="button"
                onClick={() => navigateTo("Inventory")}
                className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Go to inventory
              </button>
            </section>
          )}
        </main>
      </div>

      {showProductForm && (
        <ProductForm
          key={editingProduct?.id ?? "new-product"}
          product={editingProduct}
          onClose={closeProductForm}
          onSave={handleSaveProduct}
          saving={saving}
        />
      )}
    </div>
  );
}

function OverviewPage({
  products,
  loading,
  totalUnits,
  inventoryValue,
  lowStockProducts,
  inStockCount,
  outOfStockCount,
  onViewInventory,
  onAddProduct,
}) {
  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Your business at a glance
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good business starts here.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Monitor your inventory, keep track of stock levels, and stay on top
            of your operations.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddProduct}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add product
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading your business overview...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total products"
              value={products.length.toLocaleString()}
              description="Products in your inventory"
              icon={Package}
              iconClass="bg-indigo-50 text-indigo-600"
            />

            <StatCard
              title="Units in stock"
              value={totalUnits.toLocaleString()}
              description="Total available units"
              icon={Boxes}
              iconClass="bg-sky-50 text-sky-600"
            />

            <StatCard
              title="Inventory value"
              value={formatCurrency(inventoryValue)}
              description="Based on cost prices"
              icon={CircleDollarSign}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Low-stock products"
              value={lowStockProducts.length.toLocaleString()}
              description="Need attention"
              icon={AlertTriangle}
              iconClass="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Inventory overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A quick look at your current stock levels.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onViewInventory}
                  className="text-left text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 sm:text-right"
                >
                  Manage inventory →
                </button>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">In stock</span>
                    <span className="font-semibold text-slate-900">
                      {inStockCount} products
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${
                          products.length
                            ? (inStockCount / products.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Low stock
                    </span>
                    <span className="font-semibold text-slate-900">
                      {lowStockProducts.length} products
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{
                        width: `${
                          products.length
                            ? (lowStockProducts.length / products.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Out of stock
                    </span>
                    <span className="font-semibold text-slate-900">
                      {outOfStockCount} products
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all"
                      style={{
                        width: `${
                          products.length
                            ? (outOfStockCount / products.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                    <ClipboardList size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Products registered
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {products.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                    <TrendingUp size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Units currently tracked
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {totalUnits.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900">Stock alerts</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Products that need attention.
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                  <Bell size={19} />
                </div>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="mt-8 rounded-xl bg-emerald-50 p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={21} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-emerald-800">
                    All clear!
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    No products are currently below their stock thresholds.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => {
                    const isOutOfStock = Number(product.quantity) === 0;

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                      >
                        <div
                          className={`rounded-xl p-2.5 ${
                            isOutOfStock
                              ? "bg-rose-50 text-rose-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          <Package size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {product.quantity} units remaining
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            isOutOfStock
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isOutOfStock ? "Out" : "Low"}
                        </span>
                      </div>
                    );
                  })}

                  {lowStockProducts.length > 5 && (
                    <p className="pt-1 text-center text-xs text-slate-500">
                      +{lowStockProducts.length - 5} more products need
                      attention
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onViewInventory}
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View all products
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <ArrowDownRight size={23} />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-900">
                  Keep your inventory up to date
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Update product quantities and prices regularly to keep your
                  business records accurate.
                </p>
              </div>

              <button
                type="button"
                onClick={onViewInventory}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
              >
                Manage products
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default App;
