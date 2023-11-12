import React from "react"

export type LocaleParams = {
  params: {
    locale : string
  }
}

export interface LayoutLocaleParams extends LocaleParams {
  children: React.ReactNode;
}