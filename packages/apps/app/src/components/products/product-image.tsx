import { Center, Icon, Image } from "@chakra-ui/react"
import { LuImageOff } from "react-icons/lu"
import { R2_DOMAIN } from "@/lib/env"

export interface ProductImageProps {
  src?: string | null
  alt: string
  w?: string
  h?: string
}

function resolveImageUrl(src: string) {
  return /^https?:\/\//.test(src) ? src : `${R2_DOMAIN}/${src.replace(/^\/+/, "")}`
}

export function ProductImage(props: ProductImageProps) {
  const { src, alt, w = "full", h = "180px" } = props

  if (!src) {
    return (
      <Center w={w} h={h} bg="bg.muted">
        <Icon color="fg.muted" fontSize="2xl">
          <LuImageOff />
        </Icon>
      </Center>
    )
  }

  return <Image src={resolveImageUrl(src)} alt={alt} w={w} h={h} objectFit="cover" />
}
