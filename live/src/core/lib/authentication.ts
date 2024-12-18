import { manualLogger } from '../helpers/logger.js'
import { UserService } from '../services/user.service.js'

const userService = new UserService()

type Props = {
  cookie: string
  userId: string
}

export const handleAuthentication = async ({ cookie, userId }: Props) => {
  let response
  try {
    response = await userService.currentUser(cookie)
  } catch (error) {
    manualLogger.error('Failed to fetch current user:', error)
    throw error
  }

  if (response.id !== userId) {
    throw Error("Authentication failed: Token doesn't match the current user.")
  }

  return {
    user: {
      id: response.id,
      name: response.display_name,
    },
  }
}
