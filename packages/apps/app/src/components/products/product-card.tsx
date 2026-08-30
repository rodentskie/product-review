"use client"

import { Card, HStack, IconButton, Text } from "@chakra-ui/react"
import Link from "next/link"
import { LuPencil, LuTrash2 } from "react-icons/lu"
import { Product } from "@/lib/api"
import { ProductImage } from "./product-image"

export interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard(props: ProductCardProps) {
  const { product, onEdit, onDelete } = props

  return (
    <Card.Root overflow="hidden">
      <Link href={`/products/${product.id}`}>
        <ProductImage src={product.image} alt={product.name} />
      </Link>
      <Card.Body gap="1">
        <Card.Title>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </Card.Title>
        {product.description && (
          <Card.Description lineClamp={2}>{product.description}</Card.Description>
        )}
        <Text fontWeight="semibold">${Number(product.price).toFixed(2)}</Text>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <HStack gap="1">
          <IconButton
            aria-label="Edit product"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <LuPencil />
          </IconButton>
          <IconButton
            aria-label="Delete product"
            variant="ghost"
            size="sm"
            colorPalette="red"
            onClick={() => onDelete(product)}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      </Card.Footer>
    </Card.Root>
  )
}
