"use client"

import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react"
import * as React from "react"
import { LuPlus } from "react-icons/lu"
import { ApiError, deleteProduct, getProducts, Product } from "@/lib/api"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ProductCard } from "@/components/products/product-card"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { toaster } from "@/components/ui/toaster"

const PAGE_SIZE = 8

export default function Index() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [count, setCount] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | undefined>()

  const [deleteTarget, setDeleteTarget] = React.useState<Product | undefined>()
  const [deleting, setDeleting] = React.useState(false)

  const fetchProducts = React.useCallback(async (targetPage: number) => {
    setLoading(true)
    try {
      const result = await getProducts({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      })
      setProducts(result.data)
      setCount(result.count)
    } catch (error) {
      toaster.create({
        type: "error",
        title: error instanceof ApiError ? error.message : "Failed to load products",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProducts(page)
  }, [fetchProducts, page])

  function openCreateForm() {
    setEditingProduct(undefined)
    setFormOpen(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget.id)
      toaster.create({ type: "success", title: "Product deleted" })
      setDeleteTarget(undefined)
      fetchProducts(page)
    } catch (error) {
      toaster.create({
        type: "error",
        title: error instanceof ApiError ? error.message : "Failed to delete product",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Container maxW="6xl" py="8">
      <HStack justify="space-between" mb="6">
        <Heading size="xl">Products</Heading>
        <Button onClick={openCreateForm}>
          <LuPlus /> Add product
        </Button>
      </HStack>

      {loading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} h="280px" borderRadius="md" />
          ))}
        </SimpleGrid>
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product to get started." />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={openEditForm}
                onDelete={setDeleteTarget}
              />
            ))}
          </SimpleGrid>

          {count > PAGE_SIZE && (
            <Box mt="8" display="flex" justifyContent="center">
              <PaginationRoot
                count={count}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={(details) => setPage(details.page)}
              >
                <HStack>
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </HStack>
              </PaginationRoot>
            </Box>
          )}
        </>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSaved={() => fetchProducts(page)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete its reviews.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
