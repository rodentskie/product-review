"use client"

import { Button, Textarea, VStack } from "@chakra-ui/react"
import * as React from "react"
import { ApiError, createReview, Review } from "@/lib/api"
import { Field } from "../ui/field"
import { Rating } from "../ui/rating"
import { toaster } from "../ui/toaster"

export interface ReviewFormProps {
  productId: string
  onCreated: (review: Review) => void
}

export function ReviewForm(props: ReviewFormProps) {
  const { productId, onCreated } = props
  const [rating, setRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (rating < 1) {
      setError("Please select a rating")
      return
    }

    setSubmitting(true)
    setError(undefined)

    try {
      const review = await createReview(productId, {
        rating,
        comment: comment || undefined,
      })
      toaster.create({ type: "success", title: "Review submitted" })
      onCreated(review)
      setRating(0)
      setComment("")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong"
      setError(message)
      toaster.create({ type: "error", title: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack align="stretch" gap="3">
        <Field label="Your rating" required invalid={!!error} errorText={error}>
          <Rating value={rating} onValueChange={(details) => setRating(details.value)} />
        </Field>
        <Field label="Comment">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product"
            rows={3}
          />
        </Field>
        <Button type="submit" loading={submitting} alignSelf="flex-start">
          Submit review
        </Button>
      </VStack>
    </form>
  )
}
