import { Center, Icon, Image } from "@chakra-ui/react"
import { LuImageOff } from "react-icons/lu"

export interface ProductImageProps {
  src?: string | null
  alt: string
  w?: string
  h?: string
}

export function ProductImage(props: ProductImageProps) {
  const { src, alt, w = "full", h = "180px" } = props
  const isDisplayable = !!src && /^https?:\/\//.test(src)

  if (!isDisplayable) {
    return (
      <Center w={w} h={h} bg="bg.muted">
        <Icon color="fg.muted" fontSize="2xl">
          <LuImageOff />
        </Icon>
      </Center>
    )
  }

  return <Image src={src} alt={alt} w={w} h={h} objectFit="cover" />
}
