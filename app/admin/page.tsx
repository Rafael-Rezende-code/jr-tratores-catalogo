'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tractor, Plus, Pencil, Trash2, LogOut, Loader2, Upload, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { signIn, signOut } from "@/lib/supabase/auth"
import type { Database } from "@/lib/supabase/types"
import { useToast } from "@/hooks/use-toast"

type Tractor = Database['public']['Tables']['tractors']['Row']
type GalleryImage = Database['public']['Tables']['tractor_gallery']['Row']

const WHATSAPP_NUMBER = '553597400527'

const getPublicImageUrl = (fileName: string) => {
  return `https://tbrypcszuaxedvlmyrcn.supabase.co/storage/v1/object/public/images/${fileName}`;
};

const estadoOptions = [
  "Novo",
  "Seminovo",
  "Usado",
  "Reformado"
]

const tracaoOptions = [
  "4x2",
  "4x4",
  "6x2",
  "6x4"
]

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<any>(null)
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTractor, setEditingTractor] = useState<Tractor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    motor: '',
    potencia: '',
    tracao: '4x4',
    horas_uso: '',
    estado: 'Novo',
    localizacao: '',
    ano: new Date().getFullYear().toString(),
    single_owner: false
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [existingGallery, setExistingGallery] = useState<GalleryImage[]>([])
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchTractors()
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchTractors()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchTractors() {
    try {
      const { data, error } = await supabase
        .from('tractors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const tractorsWithUrls = data?.map(tractor => ({
        ...tractor,
        image_url: getPublicImageUrl(tractor.image_url)
      })) || []

      setTractors(tractorsWithUrls)
    } catch (error) {
      console.error('Error fetching tractors:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar tratores",
        description: "Não foi possível carregar a lista de tratores."
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchGallery(tractorId: string) {
    try {
      const { data, error } = await supabase
        .from('tractor_gallery')
        .select('*')
        .eq('tractor_id', tractorId)
        .order('sort_order', { ascending: true })

      if (error) throw error

      const galleryWithUrls = data.map(image => ({
        ...image,
        image_url: getPublicImageUrl(image.image_url)
      }))

      setExistingGallery(galleryWithUrls)
    } catch (error) {
      console.error('Error fetching gallery:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar galeria",
        description: "Não foi possível carregar as imagens da galeria."
      })
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao painel administrativo."
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    try {
      const { error } = await signOut()
      if (error) throw error
      router.push('/')
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message
      })
    }
  }

  async function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Erro no arquivo",
        description: "Por favor, selecione uma imagem válida."
      })
      return
    }

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleGalleryImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    if (validFiles.length !== files.length) {
      toast({
        variant: "destructive",
        title: "Arquivos inválidos",
        description: "Alguns arquivos foram ignorados por não serem imagens."
      })
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    
    setGalleryFiles(prev => [...prev, ...validFiles])
    setGalleryPreviews(prev => [...prev, ...newPreviews])
  }

  async function handleRemoveExistingImage(imageId: string) {
    try {
      const image = existingGallery.find(img => img.id === imageId)
      if (!image) return

      const { error: deleteError } = await supabase
        .from('tractor_gallery')
        .delete()
        .eq('id', imageId)

      if (deleteError) throw deleteError

      // Remove from storage
      const fileName = image.image_url.split('/').pop()
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([fileName])

        if (storageError) {
          console.error('Error deleting image from storage:', storageError)
        }
      }

      setExistingGallery(prev => prev.filter(img => img.id !== imageId))
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida da galeria."
      })
    } catch (error) {
      console.error('Error removing image:', error)
      toast({
        variant: "destructive",
        title: "Erro ao remover imagem",
        description: "Não foi possível remover a imagem."
      })
    }
  }

  async function handleRemoveNewImage(index: number) {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    return fileName
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let fileName = editingTractor?.image_url || ''

      if (imageFile) {
        fileName = await uploadImage(imageFile)
      } else if (!editingTractor) {
        throw new Error('Por favor, selecione uma imagem.')
      }

      const tractorData = {
        ...formData,
        price: parseFloat(formData.price),
        horas_uso: parseInt(formData.horas_uso),
        ano: parseInt(formData.ano),
        whatsapp_number: WHATSAPP_NUMBER,
        image_url: fileName,
        is_available: true
      }

      let tractorId: string

      if (editingTractor) {
        const { error } = await supabase
          .from('tractors')
          .update(tractorData)
          .eq('id', editingTractor.id)

        if (error) throw error
        tractorId = editingTractor.id
      } else {
        const { data, error } = await supabase
          .from('tractors')
          .insert([tractorData])
          .select()

        if (error) throw error
        tractorId = data[0].id
      }

      // Upload gallery images
      if (galleryFiles.length > 0) {
        const galleryUploads = await Promise.all(
          galleryFiles.map(async (file, index) => {
            const fileName = await uploadImage(file)
            return {
              tractor_id: tractorId,
              image_url: fileName,
              sort_order: existingGallery.length + index
            }
          })
        )

        const { error: galleryError } = await supabase
          .from('tractor_gallery')
          .insert(galleryUploads)

        if (galleryError) throw galleryError
      }

      toast({
        title: editingTractor ? "Trator atualizado" : "Trator adicionado",
        description: editingTractor 
          ? "As informações foram atualizadas com sucesso."
          : "O novo trator foi adicionado com sucesso."
      })

      setFormData({
        name: '',
        price: '',
        description: '',
        motor: '',
        potencia: '',
        tracao: '4x4',
        horas_uso: '',
        estado: 'Novo',
        localizacao: '',
        ano: new Date().getFullYear().toString(),
        single_owner: false
      })
      setImageFile(null)
      setPreviewUrl('')
      setGalleryFiles([])
      setGalleryPreviews([])
      setExistingGallery([])
      setEditingTractor(null)
      fetchTractors()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este trator permanentemente? Esta ação não pode ser desfeita.')) return

    try {
      // First, get the tractor data to get the image filename
      const { data: tractor, error: fetchError } = await supabase
        .from('tractors')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Get gallery images
      const { data: gallery, error: galleryError } = await supabase
        .from('tractor_gallery')
        .select('image_url')
        .eq('tractor_id', id)

      if (galleryError) throw galleryError

      // Delete all images from storage
      const imageUrls = [
        tractor?.image_url,
        ...(gallery?.map(img => img.image_url) || [])
      ].filter(Boolean)

      if (imageUrls.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove(imageUrls)

        if (storageError) {
          console.error('Error deleting images:', storageError)
        }
      }

      // Delete the tractor (this will cascade delete gallery images)
      const { error: deleteError } = await supabase
        .from('tractors')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      toast({
        title: "Trator removido",
        description: "O trator foi removido permanentemente."
      })

      fetchTractors()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: error.message
      })
    }
  }

  async function handleEdit(tractor: Tractor) {
    setEditingTractor(tractor)
    setFormData({
      name: tractor.name,
      price: tractor.price.toString(),
      description: tractor.description,
      motor: tractor.motor || '',
      potencia: tractor.potencia || '',
      tracao: tractor.tracao || '4x4',
      horas_uso: tractor.horas_uso?.toString() || '',
      estado: tractor.estado || 'Novo',
      localizacao: tractor.localizacao || '',
      ano: tractor.ano?.toString() || new Date().getFullYear().toString(),
      single_owner: tractor.single_owner || false
    })
    setPreviewUrl(tractor.image_url)
    await fetchGallery(tractor.id)
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-[#1B8B45] hover:bg-[#146832]">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adicionar/Editar Trator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="name">Nome do Trator</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="motor">Motor</Label>
                  <Input
                    id="motor"
                    value={formData.motor}
                    onChange={(e) => setFormData({ ...formData, motor: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="potencia">Potência</Label>
                  <Input
                    id="potencia"
                    value={formData.potencia}
                    onChange={(e) => setFormData({ ...formData, potencia: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tracao">Tração</Label>
                  <Select
                    value={formData.tracao}
                    onValueChange={(value) => setFormData({ ...formData, tracao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a tração" />
                    </SelectTrigger>
                    <SelectContent>
                      {tracaoOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="horas_uso">Horas de Uso</Label>
                  <Input
                    id="horas_uso"
                    type="number"
                    value={formData.horas_uso}
                    onChange={(e) => setFormData({ ...formData, horas_uso: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="single_owner"
                  checked={formData.single_owner}
                  onChange={(e) => setFormData({ ...formData, single_owner: e.target.checked })}
                  className="rounded border-gray-300 text-[#1B8B45] focus:ring-[#1B8B45]"
                />
                <Label htmlFor="single_owner">
                  Único Dono
                </Label>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Imagem Principal</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {previewUrl ? (
                        <div className="relative w-full max-w-md">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setPreviewUrl('');
                            }}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="main-image"
                              className="relative cursor-pointer rounded-md font-medium text-[#1B8B45] hover:text-[#146832] focus-within:outline-none"
                            >
                              <span>Enviar imagem</span>
                              <Input
                                id="main-image"
                                type="file"
                                className="sr-only"
                                onChange={handleMainImageChange}
                                accept="image/*"
                              />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF até 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Imagens da Galeria</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="gallery-images"
                          className="relative cursor-pointer rounded-md font-medium text-[#1B8B45] hover:text-[#146832] focus-within:outline-none"
                        >
                          <span>Enviar imagens</span>
                          <Input
                            id="gallery-images"
                            type="file"
                            className="sr-only"
                            onChange={handleGalleryImagesChange}
                            accept="image/*"
                            multiple
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </div>

                    {(galleryPreviews.length > 0 || existingGallery.length > 0) && (
                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {existingGallery.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt={`Gallery ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                onClick={() => handleRemoveExistingImage(image.id)}
                                className="bg-red-600 hover:bg-red-700 p-1 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`New Gallery ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="bg-red-600 hover:bg-red-700 p-1 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {editingTractor && (
                  <Button
                    type="button"
                    className="bg-[#1B8B45] hover:bg-[#146832] flex-1"
                    onClick={() => {
                      setEditingTractor(null)
                      setFormData({
                        name: '',
                        price: '',
                        description: '',
                        motor: '',
                        potencia: '',
                        tracao: '4x4',
                        horas_uso: '',
                        estado: 'Novo',
                        localizacao: '',
                        ano: new Date().getFullYear().toString(),
                        single_owner: false
                      })
                      setImageFile(null)
                      setPreviewUrl('')
                      setGalleryFiles([])
                      setGalleryPreviews([])
                      setExistingGallery([])
                    }}
                  >
                    Cancelar Edição
                  </Button>
                )}
                <Button 
                  type="submit"
                  className="bg-[#1B8B45] hover:bg-[#146832] flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingTractor ? (
                        <>
                          <Pencil className="mr-2 h-4 w-4" />
                          Atualizar Trator
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Trator
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tratores Cadastrados</h2>
            <Button
              className="bg-[#1B8B45] hover:bg-[#146832]"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tractors.map((tractor) => (
              <Card key={tractor.id}>
                <CardContent className="p-4">
                  <div className="relative aspect-[4/3] mb-4">
                    <img
                      src={tractor.image_url}
                      alt={tractor.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{tractor.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL' }).format(tractor.price)}
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        className="bg-[#1B8B45] hover:bg-[#146832]"
                        onClick={() => handleEdit(tractor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(tractor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}