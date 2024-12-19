import { Server } from '@hocuspocus/server'
import { getExtensions } from '@/core/extensions/index.js'
import { v4 as uuidv4 } from 'uuid'
import { TDocumentEventsServer, TUserDetails } from '@plane/editor'
import { handleAuthentication } from './lib/authentication.js'
import { manualLogger } from './helpers/logger.js'
import { DocumentCollaborativeEvents } from '@plane/editor/lib'

export const getHocusPocusServer = async () => {
  const extensions = await getExtensions()

  const serverName = process.env.HOSTNAME || uuidv4()
  return Server.configure({
    name: serverName,
    onAuthenticate: async ({ requestHeaders, context, token }) => {
      let cookie: string | undefined = undefined
      let userId: string | undefined = undefined

      // Extract cookie (fallback to request headers) and userId from token (for scenarios where
      // the cookies are not passed in the request headers)
      try {
        const parsedToken = JSON.parse(token) as TUserDetails
        userId = parsedToken.id
        cookie = parsedToken.cookie
      } catch (error) {
        // If token parsing fails, fallback to request headers
        console.error('Token parsing failed, using request headers:', error)
      } finally {
        // If cookie is still not found, fallback to request headers
        if (!cookie) {
          cookie = requestHeaders.cookie?.toString()
        }
      }

      if (!cookie || !userId) {
        throw new Error('Credentials not provided')
      }

      // set cookie in context, so it can be used throughout the ws connection
      context.cookie = cookie

      try {
        await handleAuthentication({ cookie, userId })
        manualLogger.info('Authentication successful')
      } catch (error) {
        throw Error('Authentication unsuccessful!')
      }
    },
    async onStateless({ payload, document }) {
      // broadcast the client event (derived from the server event) to all the clients so that they can update their state
      const response =
        DocumentCollaborativeEvents[payload as TDocumentEventsServer].client
      if (response) {
        document.broadcastStateless(response)
      }
    },
    extensions,
    debounce: 10000,
  })
}
