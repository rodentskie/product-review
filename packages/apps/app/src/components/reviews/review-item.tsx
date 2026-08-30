"use client"

import { Box, HStack, IconButton, Text } from "@chakra-ui/react"
import { LuTrash2 } from "react-icons/lu"
import { Review } from "@/lib/api"
import { Rating } from "../ui/rating"

export interface ReviewItemProps {
  review: Review
  onDelete: (review: Review) => void
}

export function ReviewItem(props: ReviewItemProps) {
  const { review, onDelete } = props

  return (
    <Box borderWidth="1px" borderRadius="md" p="4">
      <HStack justify="space-between" align="start">
        <Box>
          <Rating readOnly value={review.rating} size="sm" />
          <Text fontSize="xs" color="fg.muted" mt="1">
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </Box>
        <IconButton
          aria-label="Delete review"
          variant="ghost"
          size="sm"
          colorPalette="red"
          onClick={() => onDelete(review)}
        >
          <LuTrash2 />
        </IconButton>
      </HStack>
      {review.comment && (
        <Text mt="2" fontSize="sm">
          {review.comment}
        </Text>
      )}
    </Box>
  )
}
