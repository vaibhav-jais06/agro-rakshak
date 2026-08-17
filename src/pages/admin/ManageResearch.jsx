import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Edit, Trash } from 'lucide-react'
import apiService from '../../services/apiService'
import { toast } from 'react-hot-toast'

export default function ManageResearch() {
  const navigate = useNavigate()
  const [researchEntries, setResearchEntries] = useState([])
  const [loadingResearch, setLoadingResearch] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role: '',
    headline: '',
    description: '',
    avatar: '',
    photo: '',
    metrics: [],
    published: true,
    featured: false
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingResearch(true)
        const res = await apiService.api.get('/api/research?all=true')
        setResearchEntries(res.data.data || [])
      } catch (_) {
        setResearchEntries([])
      } finally {
        setLoadingResearch(false)
      }
    }
    load()
    const es = apiService.subscribeResearchUpdates(() => load())
    return () => es && es.close()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm({ name: '', role: '', headline: '', description: '', avatar: '', photo: '', metrics: [], published: true, featured: false })
  }

  const saveEntry = async () => {
    const payload = { ...form }
    if (editingId) {
      const res = await apiService.updateResearch(editingId, payload)
      if (res.success) resetForm()
    } else {
      const res = await apiService.createResearch(payload)
      if (res.success) resetForm()
    }
  }

  const startEdit = (entry) => {
    setEditingId(entry._id)
    const photo = entry.photo || (entry.afterImages || [])[0] || (entry.beforeImages || [])[0] || ''
    setForm({
      name: entry.name || '',
      role: entry.role || '',
      headline: entry.headline || '',
      description: entry.description || '',
      avatar: entry.avatar || '',
      photo: photo,
      metrics: entry.metrics || [],
      published: !!entry.published,
      featured: !!entry.featured
    })
  }

  const removeEntry = async (id) => {
    try {
      const res = await apiService.deleteResearch(id)
      if (res?.success) {
        setResearchEntries((arr) => arr.filter((e) => e._id !== id))
        if (editingId === id) resetForm()
        toast.success('Entry deleted')
      } else {
        throw new Error(res?.message || 'Delete failed')
      }
    } catch (e) {
      const msg = e?.message || 'Delete failed'
      if (msg.toLowerCase().includes('not found')) {
        setResearchEntries((arr) => arr.filter((e) => e._id !== id))
        if (editingId === id) resetForm()
        toast.success('Entry removed')
      } else {
        toast.error(msg)
      }
    }
  }

  const uploadImages = async (files, target) => {
    try {
      setUploadError('')
      setIsUploading(true)
      if (!files || files.length === 0) return
      const res = await apiService.uploadResearchImages(Array.from(files))
      const urls = (res.files || []).map((f) => f.url)
      if (target === 'avatar') {
        const nextAvatar = urls[0] || form.avatar
        setForm((f) => ({ ...f, avatar: nextAvatar }))
        if (editingId) {
          await apiService.updateResearch(editingId, { avatar: nextAvatar })
        }
      } else if (target === 'photo') {
        const nextPhoto = urls[0] || form.photo
        setForm((f) => ({ ...f, photo: nextPhoto }))
        if (editingId) {
          await apiService.updateResearch(editingId, { photo: nextPhoto })
        }
      }
    } catch (e) {
      setUploadError(e.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async (target, url) => {
    try {
      setUploadError('')
      setIsUploading(true)
      const filename = (url || '').split('/').pop()
      let payload
      if (target === 'avatar') {
        setForm((f) => ({ ...f, avatar: '' }))
        payload = { avatar: '' }
      } else if (target === 'photo') {
        setForm((f) => ({ ...f, photo: '' }))
        payload = { photo: '' }
      }
      if (editingId) {
        await apiService.updateResearch(editingId, payload)
      }
      if (filename) {
        await apiService.deleteResearchUpload(filename)
      }
    } catch (e) {
      setUploadError(e.message || 'Delete failed')
    } finally {
      setIsUploading(false)
    }
  }

  const updateMetric = (idx, field, value) => {
    setForm((f) => {
      const m = f.metrics.slice()
      m[idx] = { ...m[idx], [field]: value }
      return { ...f, metrics: m }
    })
  }

  const removeMetric = (idx) => {
    setForm((f) => {
      const m = f.metrics.slice()
      m.splice(idx, 1)
      return { ...f, metrics: m }
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-teal-600" />
            <h1 className="text-xl font-semibold text-gray-800">Research & References</h1>
          </div>
          <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md" onClick={() => navigate('/admin')}>Back to Admin</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mt-0">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-teal-600" />
            <h3 className="text-2xl font-semibold text-gray-800">Research & References</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Entries</h4>
                {loadingResearch && <span className="text-sm text-gray-500">Loading...</span>}
              </div>
              {researchEntries.length === 0 ? (
                <p className="text-gray-600">No entries</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {researchEntries.map((e) => (
                    <div key={e._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-800">{e.name}</div>
                          <div className="text-sm text-gray-500">{e.role}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(e)} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => removeEntry(e._id)} className="p-2 bg-red-100 rounded hover:bg-red-200"><Trash className="w-4 h-4 text-red-600" /></button>
                        </div>
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded ${e.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{e.published ? 'Published' : 'Draft'}</span>
                        {e.featured && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">Featured</span>}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {e.avatar && <img src={e.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border" loading="lazy" onError={(ev)=>{ev.currentTarget.style.display='none'}} />}
                        <div className="flex -space-x-2">
                          {e.photo && (
                            <img src={e.photo} alt="" className="w-8 h-8 object-cover rounded border" loading="lazy" onError={(ev)=>{ev.currentTarget.style.display='none'}} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{editingId ? 'Edit Entry' : 'Add New Entry'}</h4>
                <button onClick={resetForm} className="text-sm text-gray-600">Reset</button>
              </div>
              {uploadError && <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">{uploadError}</div>}
              {isUploading && <div className="mb-3 p-2 rounded bg-yellow-50 text-yellow-800 text-sm">Uploading...</div>}
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Farmer Name" className="w-full border border-gray-200 rounded-md p-2" />
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role/Location" className="w-full border border-gray-200 rounded-md p-2" />
                <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline (optional)" className="w-full border border-gray-200 rounded-md p-2" />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Testimonial/Description" className="w-full border border-gray-200 rounded-md p-2" rows={3} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Image</label>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e) => uploadImages(e.target.files, 'avatar')} className="text-sm" />
                    <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="/uploads/research/.." className="flex-1 border border-gray-200 rounded-md p-2" />
                    {form.avatar && (
                      <button onClick={() => removeImage('avatar', form.avatar)} className="p-2 bg-red-100 rounded hover:bg-red-200">
                        Remove
                      </button>
                    )}
                  </div>
                  {form.avatar && (
                    <div className="mt-2"><img src={form.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover border" loading="lazy" /></div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e) => uploadImages(e.target.files, 'photo')} className="text-sm" />
                    <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="/uploads/research/.." className="flex-1 border border-gray-200 rounded-md p-2" />
                    {form.photo && (
                      <button onClick={() => removeImage('photo', form.photo)} className="p-2 bg-red-100 rounded hover:bg-red-200">
                        Remove
                      </button>
                    )}
                  </div>
                  {form.photo && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <img src={form.photo} alt="" className="w-16 h-16 object-cover rounded border" loading="lazy" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Metrics</label>
                  </div>
                  <div className="space-y-2">
                    {form.metrics.map((m, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input value={m.label} onChange={(e) => updateMetric(idx, 'label', e.target.value)} placeholder="Label" className="flex-1 border border-gray-200 rounded-md p-2 w-full" />
                        <input value={m.value} onChange={(e) => updateMetric(idx, 'value', e.target.value)} placeholder="Value" className="flex-1 border border-gray-200 rounded-md p-2 w-full" />
                        <input value={m.color || ''} onChange={(e) => updateMetric(idx, 'color', e.target.value)} placeholder="#15803d" className="sm:w-28 w-full border border-gray-200 rounded-md p-2" />
                        <button onClick={() => removeMetric(idx)} className="p-2 bg-red-100 rounded hover:bg-red-200 w-full sm:w-auto"><Trash className="w-4 h-4 text-red-600" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publish</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
                </div>
                <div className="flex gap-3">
                  <button onClick={saveEntry} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
                  {editingId && <button onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Cancel</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
