"use client"

import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Separator,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import * as React from "react"
import { LuArrowLeft, LuPencil, LuTrash2 } from "react-icons/lu"
import {
  ApiError,
  deleteProduct,
  deleteReview,
  getProduct,
  getReviews,
  Product,
  Review,
} from "@/lib/api"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { ProductImage } from "@/components/products/product-image"
import { ReviewForm } from "@/components/reviews/review-form"
import { ReviewItem } from "@/components/reviews/review-item"
import { EmptyState } from "@/components/ui/empty-state"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { toaster } from "@/components/ui/toaster"

const REVIEWS_PAGE_SIZE = 5

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = params.id

  const [product, setProduct] = React.useState<Product | undefined>()
  const [loadingProduct, setLoadingProduct] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)

  const [reviews, setReviews] = React.useState<Review[]>([])
  const [reviewCount, setReviewCount] = React.useState(0)
  const [reviewPage, setReviewPage] = React.useState(1)
  const [loadingReviews, setLoadingReviews] = React.useState(true)

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteProductOpen, setDeleteProductOpen] = React.useState(false)
  const [deletingProduct, setDeletingProduct] = React.useState(false)

  const [deleteReviewTarget, setDeleteReviewTarget] = React.useState<Review | undefined>()
  const [deletingReview, setDeletingReview] = React.useState(false)

  const fetchProduct = React.useCallback(async () => {
    setLoadingProduct(true)
    try {
      const result = await getProduct(productId)
      setProduct(result)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true)
      } else {
        toaster.create({
          type: "error",
          title: error instanceof ApiError ? error.message : "Failed to load product",
        })
      }
    } finally {
      setLoadingProduct(false)
    }
  }, [productId])

  const fetchReviews = React.useCallback(
    async (targetPage: number) => {
      setLoadingReviews(true)
      try {
        const result = await getReviews(productId, {
          limit: REVIEWS_PAGE_SIZE,
          offset: (targetPage - 1) * REVIEWS_PAGE_SIZE,
        })
        setReviews(result.data)
        setReviewCount(result.count)
      } catch (error) {
        toaster.create({
          type: "error",
          title: error instanceof ApiError ? error.message : "Failed to load reviews",
        })
      } finally {
        setLoadingReviews(false)
      }
    },
    [productId],
  )

  React.useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  React.useEffect(() => {
    fetchReviews(reviewPage)
  }, [fetchReviews, reviewPage])

  async function handleDeleteProduct() {
    if (!product) return
    setDeletingProduct(true)
    try {
      await deleteProduct(product.id)
      toaster.create({ type: "success", title: "Product deleted" })
      router.push("/")
    } catch (error) {
      toaster.create({
        type: "error",
        title: error instanceof ApiError ? error.message : "Failed to delete product",
      })
      setDeletingProduct(false)
    }
  }

  async function handleDeleteReview() {
    if (!deleteReviewTarget) return
    setDeletingReview(true)
    try {
      await deleteReview(deleteReviewTarget.id)
      toaster.create({ type: "success", title: "Review deleted" })
      setDeleteReviewTarget(undefined)
      fetchReviews(reviewPage)
    } catch (error) {
      toaster.create({
        type: "error",
        title: error instanceof ApiError ? error.message : "Failed to delete review",
      })
    } finally {
      setDeletingReview(false)
    }
  }

  if (notFound) {
    return (
      <Container maxW="4xl" py="8">
        <EmptyState title="Product not found" description="It may have been deleted.">
          <Button asChild>
            <Link href="/">Back to products</Link>
          </Button>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container maxW="4xl" py="8">
      <Button variant="ghost" size="sm" mb="4" onClick={() => router.push("/")}>
        <LuArrowLeft /> Back to products
      </Button>

      {loadingProduct || !product ? (
        <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap="8">
          <Skeleton h="300px" />
          <SkeletonText noOfLines={4} />
        </Grid>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap="8" mb="10">
          <GridItem>
            <ProductImage src={product.image} alt={product.name} w="full" h="300px" />
          </GridItem>
          <GridItem>
            <VStack align="stretch" gap="3">
              <HStack justify="space-between" align="start">
                <Heading size="2xl">{product.name}</Heading>
                <HStack>
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <LuPencil /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    colorPalette="red"
                    size="sm"
                    onClick={() => setDeleteProductOpen(true)}
                  >
                    <LuTrash2 /> Delete
                  </Button>
                </HStack>
              </HStack>
              <Text fontSize="xl" fontWeight="semibold">
                ${Number(product.price).toFixed(2)}
              </Text>
              {product.description && <Text color="fg.muted">{product.description}</Text>}
            </VStack>
          </GridItem>
        </Grid>
      )}

      <Separator mb="8" />

      <Heading size="lg" mb="4">
        Reviews {reviewCount > 0 && `(${reviewCount})`}
      </Heading>

      <Box mb="8">
        {product && <ReviewForm productId={product.id} onCreated={() => fetchReviews(1)} />}
      </Box>

      {loadingReviews ? (
        <VStack align="stretch" gap="3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} h="80px" />
          ))}
        </VStack>
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Be the first to review this product." />
      ) : (
        <>
          <VStack align="stretch" gap="3">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} onDelete={setDeleteReviewTarget} />
            ))}
          </VStack>

          {reviewCount > REVIEWS_PAGE_SIZE && (
            <Box mt="6" display="flex" justifyContent="center">
              <PaginationRoot
                count={reviewCount}
                pageSize={REVIEWS_PAGE_SIZE}
                page={reviewPage}
                onPageChange={(details) => setReviewPage(details.page)}
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

      {product && (
        <ProductFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          product={product}
          onSaved={(saved) => setProduct(saved)}
        />
      )}

      <ConfirmDialog
        open={deleteProductOpen}
        onOpenChange={setDeleteProductOpen}
        title="Delete product"
        description={`Are you sure you want to delete "${product?.name}"? This will also delete its reviews.`}
        loading={deletingProduct}
        onConfirm={handleDeleteProduct}
      />

      <ConfirmDialog
        open={!!deleteReviewTarget}
        onOpenChange={(open) => !open && setDeleteReviewTarget(undefined)}
        title="Delete review"
        description="Are you sure you want to delete this review?"
        loading={deletingReview}
        onConfirm={handleDeleteReview}
      />
    </Container>
  )
}
