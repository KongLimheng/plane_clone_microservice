import { manualLogger } from '../helpers/logger.js'
import {
  getAllDocumentFormatsFromBinaryData,
  getBinaryDataFromHTMLString,
} from '../helpers/page.js'
import { PageService } from '../services/page.service.js'

const pageService = new PageService()

export const updatePageDescription = async (
  params: URLSearchParams,
  pageId: string,
  updatedDescription: Uint8Array,
  cookie: string | undefined
) => {
  if (!(updatedDescription instanceof Uint8Array)) {
    throw new Error(
      'Invalid updatedDescription: must be an instance of Uint8Array'
    )
  }

  const workspaceSlug = params.get('workspaceSlug')?.toString()
  const productId = params.get('productId')?.toString()
  if (!workspaceSlug || !productId || !cookie) return

  const { contentBinaryEncoded, contentHTML, contentJSON } =
    getAllDocumentFormatsFromBinaryData(updatedDescription)
  try {
    const payload = {
      description_binary: contentBinaryEncoded,
      description_html: contentHTML,
      description: contentJSON,
    }

    await pageService.updateDescription(
      workspaceSlug,
      productId,
      pageId,
      payload,
      cookie
    )
  } catch (error) {
    manualLogger.error('Update error:', error)
    throw error
  }
}

const fetchDescriptionHTMLAndTransform = async (
  workspaceSlug: string,
  projectId: string,
  pageId: string,
  cookie: string
) => {
  if (!workspaceSlug || !projectId || !cookie) return

  try {
    const pageDetails = await pageService.fetchDetails(
      workspaceSlug,
      projectId,
      pageId,
      cookie
    )
    const { contentBinary } = getBinaryDataFromHTMLString(
      pageDetails.description_html ?? '<p></p>'
    )
    return contentBinary
  } catch (error) {
    manualLogger.error(
      'Error while transforming from HTML to Uint8Array',
      error
    )
    throw error
  }
}

export const fetchPageDescriptionBinary = async (
  params: URLSearchParams,
  pageId: string,
  cookie: string | undefined
) => {
  const workspaceSlug = params.get('workspaceSlug')?.toString()
  const productId = params.get('projectId')?.toString()
  if (!workspaceSlug || !productId || !cookie) return null

  try {
    const response = await pageService.fetchDescriptionBinary(
      workspaceSlug,
      productId,
      pageId,
      cookie
    )
    const binaryData = new Uint8Array(response)
    if (binaryData.byteLength === 0) {
      const binary = await fetchDescriptionHTMLAndTransform(
        workspaceSlug,
        productId,
        pageId,
        cookie
      )
      if (binary) return binary
    }

    return binaryData
  } catch (error) {
    manualLogger.error('Fetch error:', error)
    throw error
  }
}
