import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

export default function WhatsAppButton() {
  const phoneNumber = '5534996160251'
  const message = 'Olá! Vi um trator no catálogo e gostaria de mais informações.'

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-[#1B8B45] hover:bg-[#1B8B45]/90 text-white"
    >
      <Phone className="w-4 h-4 mr-2" />
      WhatsApp
    </Button>
  )
}
