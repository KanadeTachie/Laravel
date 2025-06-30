"use client"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, useForm } from "@inertiajs/react"
import type React from "react"
import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  Package,
  Settings,
  LogOut,
  Plus,
  Search,
  Calendar,
  Hash,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Clock,
} from "lucide-react"

interface Item {
  id: number
  name: string
  owner_id: number
  owner?: {
    id: number
    name: string
    email: string
    is_admin: boolean
  }
  quantity: number
  date_deposited: string
  date_retrieved: string | null
  created_at: string
  updated_at: string
}

interface Props {
  auth: {
    user: {
      id: number
      name: string
      email: string
      is_admin: boolean
    }
  }
  items?: Item[]
  users?: {
    id: number
    name: string
    email: string
    is_admin: boolean
  }[]
  flash?: {
    success?: string
    error?: string
  }
  errors?: Record<string, string>
}

export default function Dashboard({ auth, items = [], users = [], flash, errors = {} }: Props) {
  const { url } = usePage()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null)

  // Create item form
  const createForm = useForm({
    name: "",
    owner_id: "" as number | string,
    quantity: "" as number | string,
    date_deposited: "",
    date_retrieved: "",
  })

  // Edit item form
  const editForm = useForm({
    name: "",
    owner_id: "" as number | string,
    quantity: "" as number | string,
    date_deposited: "",
    date_retrieved: "",
  })

  const navigation = [
    { name: "Items", href: "/dashboard", icon: Package },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner?.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    createForm.post("/items", {
      onSuccess: () => {
        setShowCreateModal(false)
        createForm.reset()
      },
    })
  }

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    editForm.patch(`/items/${editingItem.id}`, {
      onSuccess: () => {
        setShowEditModal(false)
        setEditingItem(null)
        editForm.reset()
      },
    })
  }

  const handleDelete = async () => {
    if (!deleteItem) return

    setIsDeleting(true)
    router.delete(`/items/${deleteItem.id}`, {
      onFinish: () => {
        setIsDeleting(false)
        setDeleteItem(null)
      },
    })
  }

  const openEditModal = (item: Item) => {
    setEditingItem(item)
    editForm.setData({
      name: item.name,
      owner_id: String(item.owner_id),
      quantity: String(item.quantity),
      date_deposited: item.date_deposited,
      date_retrieved: item.date_retrieved || "",
    })
    setShowEditModal(true)
    setDropdownOpen(null)
  }

  const openCreateModal = () => {
    createForm.reset()
    setShowCreateModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard - Item Management</h2>}
    >
      <Head title="Dashboard" />

      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600">Welcome, {auth.user.name}</p>
            </div>

            <nav className="px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = url.startsWith(item.href)
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </div>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <Link href="/logout" method="post">
                <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </div>
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-8">
            {/* Flash Messages */}
            {flash?.success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                {flash.success}
              </div>
            )}

            {flash?.error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {flash.error}
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Item Management</h1>
                <p className="text-gray-600">Manage inventory items and their owners</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Item Management Table */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Items ({filteredItems.length})</h2>
                <p className="text-gray-600 mb-4">A list of all items in the inventory</p>
                <div className="flex items-center space-x-2 max-w-sm">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search items or owners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Deposited
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.owner?.name}</div>
                              <div className="text-sm text-gray-500">{item.owner?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{formatDate(item.date_deposited)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.date_retrieved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.date_retrieved ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Retrieved ({formatDate(item.date_retrieved)})
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                In Storage
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative">
                            <button
                              onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
                              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {dropdownOpen === item.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Item
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteItem(item)
                                      setDropdownOpen(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Item
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label htmlFor="create_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  id="create_name"
                  type="text"
                  value={createForm.data.name}
                  onChange={(e) => createForm.setData("name", e.target.value)}
                  placeholder="Enter item name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="create_owner_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner
                </label>
                <select
                  id="create_owner_id"
                  value={createForm.data.owner_id}
                  onChange={(e) => createForm.setData("owner_id", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.owner_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select an owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.owner_id && <p className="text-sm text-red-600 mt-1">{errors.owner_id}</p>}
              </div>

              <div>
                <label htmlFor="create_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  id="create_quantity"
                  type="number"
                  min="1"
                  value={createForm.data.quantity}
                  onChange={(e) => createForm.setData("quantity", e.target.value)}
                  placeholder="Enter quantity"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="create_date_deposited" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Deposited
                </label>
                <input
                  id="create_date_deposited"
                  type="date"
                  value={createForm.data.date_deposited}
                  onChange={(e) => createForm.setData("date_deposited", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date_deposited ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date_deposited && <p className="text-sm text-red-600 mt-1">{errors.date_deposited}</p>}
              </div>

              <div>
                <label htmlFor="create_date_retrieved" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Retrieved (Optional)
                </label>
                <input
                  id="create_date_retrieved"
                  type="date"
                  value={createForm.data.date_retrieved}
                  onChange={(e) => createForm.setData("date_retrieved", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date_retrieved ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date_retrieved && <p className="text-sm text-red-600 mt-1">{errors.date_retrieved}</p>}
                <p className="text-xs text-gray-500 mt-1">Leave empty if item is still in storage</p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.processing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {createForm.processing ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Item: {editingItem.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditItem} className="space-y-4">
              <div>
                <label htmlFor="edit_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  id="edit_name"
                  type="text"
                  value={editForm.data.name}
                  onChange={(e) => editForm.setData("name", e.target.value)}
                  placeholder="Enter item name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="edit_owner_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner
                </label>
                <select
                  id="edit_owner_id"
                  value={editForm.data.owner_id}
                  onChange={(e) => editForm.setData("owner_id", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.owner_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select an owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.owner_id && <p className="text-sm text-red-600 mt-1">{errors.owner_id}</p>}
              </div>

              <div>
                <label htmlFor="edit_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  id="edit_quantity"
                  type="number"
                  min="1"
                  value={editForm.data.quantity}
                  onChange={(e) => editForm.setData("quantity", e.target.value)}
                  placeholder="Enter quantity"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="edit_date_deposited" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Deposited
                </label>
                <input
                  id="edit_date_deposited"
                  type="date"
                  value={editForm.data.date_deposited}
                  onChange={(e) => editForm.setData("date_deposited", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date_deposited ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date_deposited && <p className="text-sm text-red-600 mt-1">{errors.date_deposited}</p>}
              </div>

              <div>
                <label htmlFor="edit_date_retrieved" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Retrieved (Optional)
                </label>
                <input
                  id="edit_date_retrieved"
                  type="date"
                  value={editForm.data.date_retrieved}
                  onChange={(e) => editForm.setData("date_retrieved", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date_retrieved ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date_retrieved && <p className="text-sm text-red-600 mt-1">{errors.date_retrieved}</p>}
                <p className="text-xs text-gray-500 mt-1">Leave empty if item is still in storage</p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.processing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {editForm.processing ? "Updating..." : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the item <strong>"{deleteItem.name}"</strong>{" "}
              and remove all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(null)} />}
    </AuthenticatedLayout>
  )
}
