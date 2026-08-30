"use client"

import { useEditor } from "@tiptap/react"
import * as React from "react"

export interface RichTextEditorContextValue {
  editor: ReturnType<typeof useEditor> | null
}

export const RichTextEditorContext =
  React.createContext<RichTextEditorContextValue | null>(null)

RichTextEditorContext.displayName = "RichTextEditorContext"

export function useRichTextEditorContext() {
  const context = React.useContext(RichTextEditorContext)
  if (!context) {
    throw new Error(
      "useRichTextEditorContext must be used within a RichTextEditorRoot",
    )
  }
  return context
}
