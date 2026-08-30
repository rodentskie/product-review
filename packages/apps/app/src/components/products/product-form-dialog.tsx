"use client"

import {
  Button,
  Input,
  Textarea,
} from "@chakra-ui/react"
import * as React from "react"
import {
  ApiError,
  createProduct,
  Product,
  updateProduct,
  uploadImage,
} from "@/lib/api"
import { Field } from "../ui/field"
import {
  FileUploadDropzone,
  FileUploadList,
  FileUploadRoot,
} from "../ui/file-upload"
import { NumberInputField, NumberInputRoot } from "../ui/number-input"
import { toaster } from "../ui/toaster"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog"

export interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSaved: (product: Product) => void
}

export function ProductFormDialog(props: ProductFormDialogProps) {
  const { open, onOpenChange, product, onSaved } = props
  const isEdit = !!product

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [imageFile, setImageFile] = React.useState<File | undefined>()
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName(product?.name ?? "")
      setDescription(product?.description ?? "")
      setPrice(product?.price ?? "")
      setImageFile(undefined)
      setErrors({})
    }
  }, [open, product])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      let image: string | undefined

      if (imageFile) {
        const uploaded = await uploadImage(imageFile)
        image = uploaded.path
      }

      const input = {
        name,
        description: description || undefined,
        price: Number(price),
        ...(image ? { image } : {}),
      }

      const saved = isEdit
        ? await updateProduct(product.id, input)
        : await createProduct(input)

      toaster.create({
        type: "success",
        title: isEdit ? "Product updated" : "Product created",
      })
      onSaved(saved)
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors ?? {})
        toaster.create({ type: "error", title: error.message })
      } else {
        toaster.create({ type: "error", title: "Something went wrong" })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="center"
      size="md"
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <DialogBody display="flex" flexDirection="column" gap="4">
            <Field label="Name" required invalid={!!errors.name} errorText={errors.name?.[0]}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wireless headphones"
              />
            </Field>

            <Field
              label="Description"
              invalid={!!errors.description}
              errorText={errors.description?.[0]}
            >
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short product description"
                rows={3}
              />
            </Field>

            <Field label="Price" required invalid={!!errors.price} errorText={errors.price?.[0]}>
              <NumberInputRoot
                value={price}
                onValueChange={(details) => setPrice(details.value)}
                min={0}
                formatOptions={{ style: "currency", currency: "USD" }}
                w="full"
              >
                <NumberInputField />
              </NumberInputRoot>
            </Field>

            <Field label="Image" invalid={!!errors.image} errorText={errors.image?.[0]}>
              <FileUploadRoot
                accept="image/*"
                maxFiles={1}
                onFileChange={(details) => setImageFile(details.acceptedFiles[0])}
              >
                <FileUploadDropzone label="Drag & drop an image, or click to browse" />
                <FileUploadList />
              </FileUploadRoot>
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!name || !price}>
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
